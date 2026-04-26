/**
 * HTML to PDF Converter for CyberShield-AI Reports
 * Converts HTML content to PDF and triggers download
 */

export function downloadPDFReport(htmlContent: string, filename: string): void {
  // Create a blob from the HTML content
  const element = document.createElement('div');
  element.innerHTML = htmlContent;
  
  // Use html2pdf library for conversion
  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
  
  script.onload = () => {
    const opt = {
      margin: 10,
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
    };
    
    // @ts-ignore - html2pdf is loaded dynamically
    html2pdf().set(opt).from(element).save();
  };
  
  document.head.appendChild(script);
}

/**
 * Alternative: Download as formatted HTML/text file
 */
export function downloadTextReport(htmlContent: string, filename: string): void {
  const element = document.createElement('a');
  const file = new Blob([htmlContent], { type: 'text/html' });
  element.href = URL.createObjectURL(file);
  element.download = filename.replace('.pdf', '.html');
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

/**
 * Download report as plain text
 */
export function downloadPlainTextReport(content: string, filename: string): void {
  const element = document.createElement('a');
  const file = new Blob([content], { type: 'text/plain' });
  element.href = URL.createObjectURL(file);
  element.download = filename.replace('.pdf', '.txt');
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}
