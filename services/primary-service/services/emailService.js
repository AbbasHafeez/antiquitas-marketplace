const nodemailer = require("nodemailer")

/**
 * Send an email
 * @param {Object} options - Email options
 * @param {string} options.email - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.message - Email message (plain text)
 * @param {string} [options.html] - Email HTML content (optional)
 * @returns {Promise<Object>} Nodemailer info object
 */
const sendEmail = async (options) => {
  // Create a transporter
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  })

  // Define email options
  const mailOptions = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  }

  // Add HTML if provided
  if (options.html) {
    mailOptions.html = options.html
  }

  // Send email
  const info = await transporter.sendMail(mailOptions)
  return info
}

/**
 * Send a welcome email to a new user
 * @param {Object} user - User object
 * @param {string} user.email - User email
 * @param {string} user.name - User name
 * @param {string} verificationUrl - Email verification URL
 * @returns {Promise<Object>} Nodemailer info object
 */
const sendWelcomeEmail = async (user, verificationUrl) => {
  const subject = "Welcome to Antiquitas - Verify Your Email"
  const message = `
    Dear ${user.name},

    Welcome to Antiquitas, the premier marketplace for antiques!

    Please verify your email address by clicking on the following link:
    ${verificationUrl}

    This link will expire in 24 hours.

    If you did not create an account, please ignore this email.

    Best regards,
    The Antiquitas Team
  `

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #715a40;">Welcome to Antiquitas!</h2>
      <p>Dear ${user.name},</p>
      <p>Welcome to Antiquitas, the premier marketplace for antiques!</p>
      <p>Please verify your email address by clicking on the button below:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationUrl}" style="background-color: #715a40; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Verify Email</a>
      </div>
      <p>This link will expire in 24 hours.</p>
      <p>If you did not create an account, please ignore this email.</p>
      <p>Best regards,<br>The Antiquitas Team</p>
    </div>
  `

  return sendEmail({
    email: user.email,
    subject,
    message,
    html,
  })
}

/**
 * Send an order confirmation email
 * @param {Object} order - Order object
 * @param {Object} user - User object
 * @returns {Promise<Object>} Nodemailer info object
 */
const sendOrderConfirmationEmail = async (order, user) => {
  // Generate order items HTML
  let orderItemsHtml = ""
  let orderItemsText = ""

  order.orderItems.forEach((item) => {
    orderItemsHtml += `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover;">
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">$${item.price.toFixed(2)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">$${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `

    orderItemsText += `
      - ${item.name} (Qty: ${item.quantity}) - $${(item.price * item.quantity).toFixed(2)}
    `
  })

  const subject = `Antiquitas - Order Confirmation #${order._id}`
  const message = `
    Dear ${user.name},

    Thank you for your order! We're pleased to confirm that your order has been received and is being processed.

    Order Details:
    Order Number: ${order._id}
    Order Date: ${new Date(order.createdAt).toLocaleDateString()}
    Payment Method: ${order.paymentMethod}
    
    Items:
    ${orderItemsText}
    
    Subtotal: $${order.itemsPrice.toFixed(2)}
    Shipping: $${order.shippingPrice.toFixed(2)}
    Tax: $${order.taxPrice.toFixed(2)}
    Total: $${order.totalPrice.toFixed(2)}
    
    Shipping Address:
    ${order.shippingAddress.street}
    ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}
    ${order.shippingAddress.country}
    
    We'll send you another email when your order ships.
    
    Thank you for shopping with Antiquitas!
    
    Best regards,
    The Antiquitas Team
  `

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #715a40;">Order Confirmation</h2>
      <p>Dear ${user.name},</p>
      <p>Thank you for your order! We're pleased to confirm that your order has been received and is being processed.</p>
      
      <div style="background-color: #f9f9f9; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <h3 style="margin-top: 0;">Order Details</h3>
        <p><strong>Order Number:</strong> ${order._id}</p>
        <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
        <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
      </div>
      
      <h3>Items</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #f2f2f2;">
            <th style="padding: 10px; text-align: left;">Image</th>
            <th style="padding: 10px; text-align: left;">Product</th>
            <th style="padding: 10px; text-align: left;">Price</th>
            <th style="padding: 10px; text-align: left;">Qty</th>
            <th style="padding: 10px; text-align: left;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${orderItemsHtml}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="4" style="text-align: right; padding: 10px;"><strong>Subtotal:</strong></td>
            <td style="padding: 10px;">$${order.itemsPrice.toFixed(2)}</td>
          </tr>
          <tr>
            <td colspan="4" style="text-align: right; padding: 10px;"><strong>Shipping:</strong></td>
            <td style="padding: 10px;">$${order.shippingPrice.toFixed(2)}</td>
          </tr>
          <tr>
            <td colspan="4" style="text-align: right; padding: 10px;"><strong>Tax:</strong></td>
            <td style="padding: 10px;">$${order.taxPrice.toFixed(2)}</td>
          </tr>
          <tr style="background-color: #f2f2f2;">
            <td colspan="4" style="text-align: right; padding: 10px;"><strong>Total:</strong></td>
            <td style="padding: 10px;"><strong>$${order.totalPrice.toFixed(2)}</strong></td>
          </tr>
        </tfoot>
      </table>
      
      <div style="background-color: #f9f9f9; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <h3 style="margin-top: 0;">Shipping Address</h3>
        <p>${order.shippingAddress.street}</p>
        <p>${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}</p>
        <p>${order.shippingAddress.country}</p>
      </div>
      
      <p>We'll send you another email when your order ships.</p>
      <p>Thank you for shopping with Antiquitas!</p>
      
      <p>Best regards,<br>The Antiquitas Team</p>
    </div>
  `

  return sendEmail({
    email: user.email,
    subject,
    message,
    html,
  })
}

/**
 * Send a password reset email
 * @param {Object} user - User object
 * @param {string} resetUrl - Password reset URL
 * @returns {Promise<Object>} Nodemailer info object
 */
const sendPasswordResetEmail = async (user, resetUrl) => {
  const subject = "Antiquitas - Password Reset Request"
  const message = `
    Dear ${user.name},

    You are receiving this email because you (or someone else) has requested the reset of a password.

    Please click on the following link to reset your password:
    ${resetUrl}

    This link will expire in 10 minutes.

    If you did not request this, please ignore this email and your password will remain unchanged.

    Best regards,
    The Antiquitas Team
  `

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #715a40;">Password Reset Request</h2>
      <p>Dear ${user.name},</p>
      <p>You are receiving this email because you (or someone else) has requested the reset of a password.</p>
      <p>Please click on the button below to reset your password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #715a40; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
      </div>
      <p>This link will expire in 10 minutes.</p>
      <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
      <p>Best regards,<br>The Antiquitas Team</p>
    </div>
  `

  return sendEmail({
    email: user.email,
    subject,
    message,
    html,
  })
}

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendOrderConfirmationEmail,
  sendPasswordResetEmail,
}
