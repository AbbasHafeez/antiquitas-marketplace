const { sendEmail } = require("./utils/mailer");

sendEmail({
  email: "your_email@gmail.com",  // 🔁 Replace with your own email
  subject: "🎉 Test Email from Antiquitas",
  message: "This is a test email sent from the microservice.",
  html: "<h2>This is a <span style='color:green;'>test email</span> from your backend!</h2>",
})
  .then(() => console.log("✅ Test email sent successfully!"))
  .catch((err) => console.error("❌ Failed to send test email:", err));
