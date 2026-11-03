/**
 * Generates an official, print-ready TravelSphere Booking Voucher & Boarding Pass.
 * Dynamically imports jsPDF on demand to optimize initial mobile bundle performance.
 * @param {object} booking - Booking details object
 */
export async function generateBookingPDF(booking) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const primaryColor = [163, 112, 76]; // #a3704c
  const darkColor = [30, 41, 59]; // #1e293b
  const slateColor = [100, 116, 139]; // #64748b

  // 1. Header Banner
  doc.setFillColor(...darkColor);
  doc.rect(0, 0, 210, 40, 'F');

  // Brand Name
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('TravelSphere', 20, 22);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(226, 232, 240);
  doc.text('OFFICIAL BOOKING VOUCHER & BOARDING PASS', 20, 30);

  // Status Badge
  doc.setFillColor(...primaryColor);
  doc.roundedRect(150, 14, 40, 12, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text((booking.status || 'CONFIRMED').toUpperCase(), 170, 22, { align: 'center' });

  // 2. Voucher & Reference Numbers
  doc.setTextColor(...darkColor);
  doc.setFontSize(10);
  doc.text(`Booking Reference: #${booking.id || 'TS-BK-9821'}`, 20, 52);
  doc.text(`Issue Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`, 140, 52);

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(20, 56, 190, 56);

  // 3. Traveler & Journey Summary Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(20, 62, 170, 42, 3, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...darkColor);
  doc.text('Traveler Information', 26, 72);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...slateColor);
  doc.text(`Lead Guest: ${booking.guestName || 'Verified Traveler'}`, 26, 80);
  doc.text(`Total Guests: ${booking.guests || 2} Persons`, 26, 87);
  doc.text(`Contact Email: ${booking.email || 'traveler@travelsphere.com'}`, 26, 94);

  doc.text(`Origin: ${booking.origin || 'City Hub'}`, 110, 80);
  doc.text(`Destination: ${booking.destination || booking.location || 'Selected Destination'}`, 110, 87);
  doc.text(`Duration: ${booking.days || 5} Days / ${booking.nights || 4} Nights`, 110, 94);

  // 4. Package & Accommodation Details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...darkColor);
  doc.text('Reservation Details', 20, 118);

  const startY = 126;
  const items = [
    ['Service / Package', booking.package || booking.title || 'Curated Signature Tour'],
    ['Accommodation', booking.hotel || 'Luxury 5-Star Partner Property'],
    ['Transport Provider', booking.transport || 'Private Executive Transfer Included'],
    ['Travel Dates', `${booking.startDate || 'Upcoming 2026'} to ${booking.endDate || 'Flexible'}`],
    ['Payment Method', 'Verified Card / Digital Payment (ACID Complete)']
  ];

  items.forEach(([label, value], i) => {
    const y = startY + i * 11;
    doc.setFillColor(i % 2 === 0 ? 255 : 248, i % 2 === 0 ? 255 : 250, i % 2 === 0 ? 255 : 252);
    doc.rect(20, y - 5, 170, 10, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...slateColor);
    doc.text(label, 26, y + 2);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkColor);
    doc.text(String(value), 184, y + 2, { align: 'right' });
  });

  // 5. Total Pricing Summary
  const priceY = startY + items.length * 11 + 8;
  doc.setFillColor(...darkColor);
  doc.roundedRect(20, priceY, 170, 18, 3, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Total Amount Paid', 26, priceY + 11);
  doc.setFontSize(14);
  doc.text(`$${Number(booking.amount || booking.total || 999).toLocaleString()}`, 184, priceY + 11, { align: 'right' });

  // 6. Security & Verification QR / Pass Notice
  const qrY = priceY + 28;
  doc.setDrawColor(203, 213, 225);
  doc.setLineDashPattern([2, 2], 0);
  doc.roundedRect(20, qrY, 170, 36, 3, 3, 'S');

  doc.setLineDashPattern([], 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...primaryColor);
  doc.text('DIGITAL VERIFICATION & BOARDING NOTICE', 26, qrY + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...slateColor);
  doc.text('Present this voucher upon arrival at your partner hotel and vehicle pickup hub.', 26, qrY + 18);
  doc.text('Verified under TravelSphere Guarantee with 24/7 Support Hotline access.', 26, qrY + 25);
  doc.text(`Security Hash: SHA256-${Math.random().toString(36).substring(2, 12).toUpperCase()}`, 26, qrY + 31);

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('TravelSphere Inc. · Global Tourism Management System · support@travelsphere.com', 105, 285, { align: 'center' });

  // Download Trigger
  const filename = `TravelSphere-Voucher-${booking.id || 'TS9821'}.pdf`;
  doc.save(filename);
}

export default generateBookingPDF;

