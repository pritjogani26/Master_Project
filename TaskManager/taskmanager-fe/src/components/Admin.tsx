import React, { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '@/API/interceptor';

export interface LoginActivity {
  id: number;
  user_id: number;
  email: string;
  ip_address: string;
  user_agent: string | null;
  device_type: string | null;
  browser: string | null;
  os: string | null;
  status: "SUCCESS" | "FAILED" | string;
  failure_reason: string | null;
  login_time: string; 
  logout_time: string | null; 
  is_active: boolean;
  session_id: string | null;
}

export default function LoginActivityDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  // Added a loading state specifically for the PDF download button
  const [isDownloading, setIsDownloading] = useState(false); 
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [isDownloadingExcel, setIsDownloadingExcel] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
  const fetchLoginActivity = async ({ queryKey }: any): Promise<any> => {
    const [_key, pageParam] = queryKey; 
    const response = await api.get(`http://localhost:8000/auth/loginactivity/?p=${pageParam}`);
    return response.data;
  };

  const { 
    data, 
    isLoading, 
    isError, 
    isFetching 
  } = useQuery({
    queryKey: ['loginActivity', page],
    queryFn: fetchLoginActivity,
    placeholderData: keepPreviousData,
  });

  const logsArray = data?.results || [];

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const timeStringWithZone = dateString.endsWith('Z') ? dateString : `${dateString}Z`;
    const date = new Date(timeStringWithZone);
    return new Intl.DateTimeFormat('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  };

  const filteredLogs: LoginActivity[] = logsArray.filter((log: LoginActivity) => {
    const lowerCaseTerm = searchTerm.toLowerCase();
    const emailMatch = log.email?.toLowerCase().includes(lowerCaseTerm);
    const ipMatch = log.ip_address?.toLowerCase().includes(lowerCaseTerm);
    return emailMatch || ipMatch;
  });

  // --- NEW PDF EXPORT LOGIC ---
  const handleExportPDF = async () => {
    try {
      setIsDownloading(true);
      
      // 1. Hit your Django endpoint. 
      // CRITICAL: responseType 'blob' tells Axios to treat the response as binary file data!
      const response = await api.get('http://localhost:8000/auth/loginreport/', {
        responseType: 'blob', 
      });

      // 2. Create a Blob object from the binary data
      const blob = new Blob([response.data], { type: 'application/pdf' });
      
      // 3. Create a temporary URL for the Blob
      const url = window.URL.createObjectURL(blob);
      
      // 4. Create an invisible anchor tag to trigger the download
      const link = document.createElement('a');
      link.href = url;
      
      // Generate a clean filename with today's date
      const dateStr = new Date().toISOString().slice(0, 10);
      link.setAttribute('download', `login_activity_${dateStr}.pdf`);
      
      // 5. Append to body, click it, and clean up the DOM
      document.body.appendChild(link);
      link.click();
      
      // Clean up the URL object to free memory
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error("Failed to download PDF report:", error);
      alert("Failed to generate the PDF report. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };




  const handleExportExcel = async () => {
    try {
      setIsDownloadingExcel(true);
      
      // 1. Hit your new Django Excel endpoint
      // CRITICAL: responseType 'blob' is still required for Excel files!
      const response = await api.get('http://localhost:8000/auth/loginreport/excel/', {
        responseType: 'blob', 
      });

      // 2. Create a Blob using the official Microsoft Excel MIME type
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      // 3. Create the temporary download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // 4. Set the filename with a .xlsx extension
      const dateStr = new Date().toISOString().slice(0, 10);
      link.setAttribute('download', `login_activity_${dateStr}.xlsx`);
      
      // 5. Trigger download and clean up
      document.body.appendChild(link);
      link.click();
      
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error("Failed to download Excel report:", error);
      alert("Failed to generate the Excel report. Please try again.");
    } finally {
      setIsDownloadingExcel(false);
    }
  };
  // ----------------------------

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading logs...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    navigate("/login");
  }

  const totalPages = data?.count ? Math.ceil(data.count / 10) : 1;

  return (
    <div className="container-fluid mt-4">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
        <h2 className="mb-2 mb-md-0">Login Activity Monitor</h2>
        <span className="text-muted fw-semibold">
          Showing: {filteredLogs.length} of {data?.count || 0} total records
        </span>
      </div>
      
      {/* Controls: Search and Export */}
      <div className="card shadow-sm mb-4">
        <div className="card-body p-3 d-flex flex-column flex-md-row justify-content-between gap-3">
          <input 
            type="text" 
            placeholder="Search current page by email or IP..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-control w-100"
            style={{ maxWidth: '400px' }}
          />
          
          {/* Updated Export Button */}
        <div className="dropdown" style={{ position: 'relative' }}>
  <button 
    className="btn btn-primary dropdown-toggle d-flex align-items-center gap-2" 
    type="button" 
    // Let React handle the click instead of Bootstrap JS
    onClick={() => setDropdownOpen(!dropdownOpen)} 
    disabled={isDownloading || isDownloadingExcel}
  >
    {isDownloading || isDownloadingExcel ? (
      <>
        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        {isDownloading ? "Generating PDF..." : "Generating Excel..."}
      </>
    ) : (
      "Export Data"
    )}
  </button>
  
  {/* Dynamically add the 'show' class based on our React state */}
  <ul 
    className={`dropdown-menu shadow-sm ${dropdownOpen ? 'show' : ''}`} 
    style={{ position: 'absolute', right: 0, top: '100%', marginTop: '0.25rem' }}
  >
    <li>
      <button 
        className="dropdown-item fw-semibold text-danger" 
        onClick={() => {
          setDropdownOpen(false); // Close the menu when clicked
          handleExportPDF();
        }}
      >
        Export to PDF
      </button>
    </li>
    <li>
      <button 
        className="dropdown-item fw-semibold text-success" 
        onClick={() => {
          setDropdownOpen(false); // Close the menu when clicked
          handleExportExcel();
        }}
      >
        Export to Excel
      </button>
    </li>
  </ul>
</div>
        </div>
      </div>

      {/* Table */}
      <div className="table-responsive shadow-sm rounded bg-white" style={{ opacity: isFetching ? 0.6 : 1, transition: 'opacity 0.2s ease-in-out' }}>
        <table className="table table-hover table-striped align-middle mb-0">
          <thead className="table-dark">
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Email</th>
              <th scope="col">IP Address</th>
              <th scope="col" style={{ maxWidth: '200px' }}>Client</th>
              <th scope="col">Login Time</th>
              <th scope="col">Logout Time</th>
              <th scope="col">Status</th>
              <th scope="col">Session</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log) => (
              <tr key={log.id}>
                <td className="fw-bold text-nowrap">#{log.id}</td>
                <td>{log.email}</td>
                <td className="font-monospace text-muted">{log.ip_address}</td>
                <td 
                  className="text-truncate" 
                  style={{ maxWidth: '200px' }} 
                  title={log.user_agent || ""}
                >
                  {log.user_agent}
                </td>
                <td className="text-nowrap">{formatDate(log.login_time)}</td>
                <td className="text-nowrap">{formatDate(log.logout_time || "")}</td>
                <td>
                  <span className={`badge ${log.status === 'SUCCESS' ? 'bg-success' : 'bg-danger'}`}>
                    {log.status}
                  </span>
                </td>
                <td className="text-nowrap">
                  {log.is_active ? (
                    <span className="text-success fw-bold d-flex align-items-center gap-2">
                      <span className="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>
                      Active
                    </span>
                  ) : (
                    <span className="text-secondary fw-semibold">Ended</span>
                  )}
                </td>
              </tr>
            ))}
            
            {/* Empty State */}
            {(!filteredLogs || filteredLogs.length === 0) && (
              <tr>
                <td colSpan={8} className="text-center text-muted py-5">
                  {searchTerm 
                    ? `No results found for "${searchTerm}" on this page.` 
                    : "No login activity found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="d-flex justify-content-center align-items-center gap-3 mt-4 mb-5">
        <button 
          onClick={() => setPage(old => Math.max(old - 1, 1))} 
          disabled={page === 1}
          className="btn btn-outline-primary px-4"
        >
          &laquo; Previous
        </button>
        
        <span className="fw-semibold text-secondary">
          Page {page} of {totalPages}
        </span>
        
        <button 
          onClick={() => {
            if (data?.next) {
              setPage(old => old + 1);
            }
          }} 
          disabled={!data?.next}
          className="btn btn-outline-primary px-4"
        >
          Next &raquo;
        </button>
      </div>
    </div>
  );
}