module.exports = {
  welcome: `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #0A0A0B; color: #F0F0F5;">
      <h1 style="color: #00FF87;">Welcome to Obsidian ELMS</h1>
      <p>Hello {{name}}, your account has been created by your administrator.</p>
      <p>Role: <strong>{{role}}</strong></p>
      <div style="margin: 20px 0; padding: 15px; border-left: 4px solid #00FF87; background-color: #111114;">
        <p><strong>Login Email:</strong> {{email}}</p>
        <p><strong>Temporary Password:</strong> {{password}}</p>
      </div>
      <p style="color: #8888A0; font-size: 12px;">Please log in and change your password immediately.</p>
    </div>
  `,
  otp: `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #0A0A0B; color: #F0F0F5;">
      <h1 style="color: #00FF87;">Login Verification</h1>
      <p>Your one-time login code is:</p>
      <h2 style="letter-spacing: 5px; color: #00FF87;">{{otp}}</h2>
      <p style="color: #8888A0; font-size: 12px;">This code will expire in 10 minutes.</p>
    </div>
  `
};
