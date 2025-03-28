export const baseTemplate = (content: string) => `
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    /* Reset CSS */
    body, p, h1, h2, h3, h4, h5, h6, ul, ol, li {
      margin: 0;
      padding: 0;
    }
    
    /* Base styles */
    body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1F2937;
      background-color: #F3F4F6;
    }

    /* Container */
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #FFFFFF;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    }

    /* Header */
    .header {
      text-align: center;
      padding: 20px 0;
      border-bottom: 1px solid #E5E7EB;
      margin-bottom: 24px;
    }

    .logo {
      font-size: 24px;
      font-weight: bold;
      color: #2563EB;
      text-decoration: none;
    }

    /* Content */
    .content {
      padding: 0 24px;
    }

    /* Typography */
    h1 {
      color: #1F2937;
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 16px;
    }

    h2 {
      color: #374151;
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 12px;
    }

    p {
      color: #4B5563;
      margin-bottom: 16px;
    }

    /* Table */
    .table {
      width: 100%;
      border-collapse: collapse;
      margin: 24px 0;
      background-color: #FFFFFF;
      border-radius: 8px;
      overflow: hidden;
    }

    .table th {
      background-color: #F3F4F6;
      padding: 12px;
      text-align: left;
      font-weight: 600;
      color: #374151;
      border-bottom: 2px solid #E5E7EB;
    }

    .table td {
      padding: 12px;
      border-bottom: 1px solid #E5E7EB;
      color: #4B5563;
    }

    .table tr:last-child td {
      border-bottom: none;
    }

    /* Buttons */
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #2563EB;
      color: #FFFFFF;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 500;
      margin: 16px 0;
    }

    .button:hover {
      background-color: #1D4ED8;
    }

    /* Footer */
    .footer {
      text-align: center;
      padding: 24px;
      margin-top: 24px;
      border-top: 1px solid #E5E7EB;
      color: #6B7280;
      font-size: 14px;
    }

    /* Utilities */
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .text-bold { font-weight: 600; }
    .text-blue { color: #2563EB; }
    .text-gray { color: #6B7280; }
    .mt-4 { margin-top: 16px; }
    .mb-4 { margin-bottom: 16px; }

    /* Responsive */
    @media screen and (max-width: 600px) {
      .container {
        width: 100%;
        padding: 16px;
      }
      
      .content {
        padding: 0 16px;
      }
      
      .table {
        display: block;
        overflow-x: auto;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Bud-Jet</div>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Bud-Jet. Tutti i diritti riservati.</p>
      <p class="mt-4">Questa è una notifica automatica. Non rispondere a questa email.</p>
    </div>
  </div>
</body>
</html>
`;
