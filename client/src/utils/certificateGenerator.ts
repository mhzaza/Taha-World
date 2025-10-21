import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface CertificateData {
  userName: string;
  courseTitle: string;
  issuedDate: string;
  verificationCode: string;
}

export const generateCertificatePDF = async (certificate: CertificateData): Promise<void> => {
  try {
    // Debug logging
    console.log('Certificate generation started with data:', {
      userName: certificate.userName,
      courseTitle: certificate.courseTitle,
      issuedDate: certificate.issuedDate,
      verificationCode: certificate.verificationCode
    });

    // Create a temporary container for the certificate HTML
    const tempContainer = document.createElement('div');
    tempContainer.style.cssText = `
      position: fixed;
      top: -10000px;
      left: -10000px;
      width: 1200px;
      height: 800px;
      overflow: visible;
      z-index: -1;
    `;

    // Prepare data with proper encoding and validation
    const safeUserName = certificate.userName && certificate.userName.trim() 
      ? certificate.userName.trim().replace(/["'<>]/g, '') 
      : 'Name Not Available';
    
    const safeCourseTitle = certificate.courseTitle && certificate.courseTitle.trim()
      ? certificate.courseTitle.trim().replace(/["'<>]/g, '') 
      : 'Course Title Not Available';
    
    const safeVerificationCode = certificate.verificationCode && certificate.verificationCode.trim()
      ? certificate.verificationCode.trim().replace(/["'<>]/g, '') 
      : 'N/A';
    
    const issueDate = new Date(certificate.issuedDate);
    const formattedDate = isNaN(issueDate.getTime()) 
      ? new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : issueDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });

    console.log('Safe data prepared:', {
      safeUserName,
      safeCourseTitle,
      safeVerificationCode,
      formattedDate
    });
    
    const certificateHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Certificate</title>
      </head>
      <body>
        <div id="certificate-content" style="
          width: 1200px;
          height: 800px;
          background: white;
          position: relative;
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 80px;
          box-sizing: border-box;
          display: block;
          border: 8px solid #1e40af;
        ">
          <!-- Border frames -->
          <div style="position: absolute; top: 60px; left: 60px; right: 60px; bottom: 60px; border: 4px solid #1e40af; border-radius: 12px; box-sizing: border-box;"></div>
          <div style="position: absolute; top: 80px; left: 80px; right: 80px; bottom: 80px; border: 2px solid rgba(30, 64, 175, 0.3); border-radius: 8px; box-sizing: border-box;"></div>
          
          <!-- Corner decorations -->
          <div style="position: absolute; top: 40px; left: 40px; width: 40px; height: 40px; border: 4px solid #1e40af; border-right: none; border-bottom: none; border-radius: 8px 0 0 0;"></div>
          <div style="position: absolute; top: 40px; right: 40px; width: 40px; height: 40px; border: 4px solid #1e40af; border-left: none; border-bottom: none; border-radius: 0 8px 0 0;"></div>
          <div style="position: absolute; bottom: 40px; left: 40px; width: 40px; height: 40px; border: 4px solid #1e40af; border-right: none; border-top: none; border-radius: 0 0 0 8px;"></div>
          <div style="position: absolute; bottom: 40px; right: 40px; width: 40px; height: 40px; border: 4px solid #1e40af; border-left: none; border-top: none; border-radius: 0 0 8px 0;"></div>
          
          <!-- Header Section -->
          <div style="text-align: center; margin-top: 40px; margin-bottom: 60px;">
            <div style="font-size: 28px; font-weight: bold; color: #1e40af; margin-bottom: 8px; letter-spacing: 2px;">TAHA SABAGH ACADEMY</div>
            <div style="font-size: 14px; color: #6b7280; margin-bottom: 50px; letter-spacing: 2px;">Excellence in Professional Development</div>
            
            <div style="width: 200px; height: 3px; background: #1e40af; margin: 0 auto 40px;"></div>
            
            <h1 style="font-size: 64px; font-weight: bold; color: #1e293b; margin: 0 0 20px 0;">CERTIFICATE</h1>
            <p style="font-size: 28px; color: #475569; margin: 0 0 50px 0;">OF COMPLETION</p>
            
            <div style="width: 150px; height: 4px; background: #1e40af; margin: 0 auto;"></div>
          </div>
          
          <!-- Main Content Area -->
          <div style="text-align: center; height: 400px; display: flex; flex-direction: column; justify-content: center; align-items: center; position: relative; padding: 0 60px;">
            
            <!-- Certification statement -->
            <p style="font-size: 22px; color: #374151; margin-bottom: 50px;">This is to certify that</p>
            
            <!-- Official seal positioned above name -->
            <div style="position: relative; margin-bottom: 40px;">
              <div style="width: 120px; height: 120px; border: 5px solid #1e40af; border-radius: 50%; background: white; display: flex; align-items: center; justify-content: center; margin: 0 auto; position: relative;">
                <div style="position: absolute; top: 30%; font-size: 11px; font-weight: bold; color: #1e40af; letter-spacing: 2px;">OFFICIAL</div>
                <div style="position: absolute; top: 55%; font-size: 28px; color: #1e40af; font-weight: bold;">&checkmark;</div>
              </div>
            </div>
            
            <!-- Recipient name -->
            <div style="font-size: 48px; font-weight: bold; color: #1e293b; padding: 35px 50px; border-top: 3px solid #e5e7eb; border-bottom: 3px solid #e5e7eb; margin-bottom: 50px; text-decoration: underline; text-decoration-color: #1e40af; text-decoration-thickness: 4px; min-height: 120px; display: flex; align-items: center; justify-content: center;">
              ${safeUserName}
            </div>
            
            <!-- Achievement statement -->
            <p style="font-size: 24px; color: #475569; margin-bottom: 40px;">has successfully completed the course</p>
            
            <!-- Course title -->
            <div style="font-size: 32px; color: #1e40af; font-weight: bold; margin: 30px 0; padding: 25px 50px; background: #f8fafc; border: 3px solid #1e40af; border-radius: 15px; display: inline-block; max-width: 80%;">
              ${safeCourseTitle}
            </div>
          </div>
          
          <!-- Footer Section -->
          <div style="position: absolute; bottom: 80px; left: 120px; right: 120px; display: flex; justify-content: space-between; align-items: flex-end;">
            <div style="text-align: left;">
              <h4 style="font-size: 12px; color: #9ca3af; margin-bottom: 12px; font-weight: bold; letter-spacing: 2px;">DATE OF ISSUE</h4>
              <div style="font-size: 18px; color: #374151; font-weight: bold;">${formattedDate}</div>
            </div>
            
            <div style="text-align: right;">
              <h4 style="font-size: 12px; color: #9ca3af; margin-bottom: 12px; font-weight: bold; letter-spacing: 2px;">VERIFICATION CODE</h4>
              <div style="font-size: 18px; color: #374151; font-weight: bold; background: #f8fafc; padding: 12px 20px; border-radius: 8px; border: 2px solid #1e40af; display: inline-block; letter-spacing: 2px;">${safeVerificationCode}</div>
            </div>
          </div>
          
          <!-- Signature Section -->
          <div style="position: absolute; bottom: 200px; right: 120px; text-align: center;">
            <div style="width: 200px; height: 3px; background: #1e293b; margin: 0 auto 15px;"></div>
            <div style="font-size: 16px; color: #6b7280; font-weight: bold; letter-spacing: 1px;">Director of Training</div>
          </div>
        </div>
      </body>
      </html>
    `;

    tempContainer.innerHTML = certificateHTML;
    document.body.appendChild(tempContainer);

    // Wait for DOM to be ready
    await new Promise(resolve => setTimeout(resolve, 500));

    const certificateElement = tempContainer.querySelector('#certificate-content') as HTMLElement;
    
    if (!certificateElement) {
      throw new Error('Certificate element not found');
    }

    console.log('Certificate element found:', certificateElement);

    // Convert to canvas with better options
    const canvas = await html2canvas(certificateElement, {
      width: 1200,
      height: 800,
      scale: 1.5,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      logging: true,
      removeContainer: false
    });

    console.log('Canvas created:', canvas.width, 'x', canvas.height);

    if (canvas.width === 0 || canvas.height === 0) {
      throw new Error('Canvas dimensions are zero');
    }

    // Create PDF
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Convert canvas to image
    const imgData = canvas.toDataURL('image/png', 1.0);
    
    if (!imgData || imgData === 'data:,') {
      throw new Error('Failed to generate image data');
    }

    // Calculate dimensions to fit A4 landscape
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const finalWidth = imgWidth * ratio;
    const finalHeight = imgHeight * ratio;
    
    const x = (pdfWidth - finalWidth) / 2;
    const y = (pdfHeight - finalHeight) / 2;

    pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight);

    // Generate filename using safe data
    const filename = `Certificate_${safeCourseTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${safeUserName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;

    // Save the PDF
    pdf.save(filename);

    // Clean up
    if (tempContainer && tempContainer.parentNode) {
      document.body.removeChild(tempContainer);
    }

    console.log('PDF generated successfully:', filename);
    console.log('Certificate data used:', {
      userName: safeUserName,
      courseTitle: safeCourseTitle,
      verificationCode: safeVerificationCode,
      date: formattedDate
    });

  } catch (error) {
    console.error('Error generating certificate PDF:', error);
    
    // Clean up temp container if it exists
    try {
      const tempContainer = document.querySelector('div[style*="top: -10000px"]');
      if (tempContainer && tempContainer.parentNode) {
        document.body.removeChild(tempContainer);
      }
    } catch (cleanupError) {
      console.warn('Error during cleanup:', cleanupError);
    }
    
    throw new Error('Failed to generate certificate: ' + (error as Error).message);
  }
};
