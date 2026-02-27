const bcrypt = require('bcryptjs');
const User = require('../../models/User');
const { sendEmail } = require('../../utils/email');
require('dotenv').config();

// ====================== SEND VERIFICATION EMAIL ======================
exports.sendVerificationEmail = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    if (user.emailVerified) {
      return res.status(400).json({ status: 'error', message: 'Email is already verified' });
    }

    // ✅ Fix: was calling user.emailVerificationToken() which doesn't exist
    const verificationToken = user.generateSecureToken('emailVerificationToken', 60);
    await user.save({ validateBeforeSave: false });

    // ✅ Correct frontend route: /verify-email/:token
    const verifyURL = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

    await sendEmail({
      to: user.email,
      subject: 'Verify Your Email Address',
      html: `
        <h2>Welcome to iWorkCore</h2>
        <p>Please confirm your email address by clicking the link below:</p>
        <a href="${verifyURL}" target="_blank">Verify Email</a>
        <p>This link will expire in 1 hour.</p>
      `,
    });

    res.status(200).json({
      status: 'success',
      message: 'Verification email sent successfully',
    });
  } catch (error) {
    console.error('Send verification email error:', error);
    res.status(500).json({ status: 'error', message: 'Server error while sending verification email' });
  }
};


// ====================== VERIFY EMAIL ======================
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    console.log('[VerifyEmail] Token received:', token);

    const users = await User.find({
      emailVerificationTokenExpires: { $gt: Date.now() },
    });

    console.log('[VerifyEmail] Users with valid expiry found:', users.length);

    const user = users.find(u => {
      const match = bcrypt.compareSync(token, u.emailVerificationToken);
      console.log('[VerifyEmail] Checking:', u.email, '| match:', match);
      return match;
    });

    if (!user) {
      console.log('[VerifyEmail] No matching user found');
      return res.status(400).json({ status: 'error', message: 'Invalid or expired verification token' });
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationTokenExpires = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({ status: 'success', message: 'Email verified successfully' });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ status: 'error', message: 'Server error while verifying email' });
  }
};


// ====================== RESEND VERIFICATION EMAIL ======================
exports.resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ status: 'error', message: 'Email is required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ status: 'error', message: 'No user found with that email address' });
    }

    if (user.emailVerified) {
      return res.status(400).json({ status: 'error', message: 'Email is already verified' });
    }

    const newVerificationToken = user.generateSecureToken('emailVerificationToken', 60);
    await user.save({ validateBeforeSave: false });

    // ✅ Fix: was /auth/verify-email/ which doesn't match frontend route
    const verifyURL = `${process.env.FRONTEND_URL}/verify-email/${newVerificationToken}`;

    await sendEmail({
      to: user.email,
      subject: 'Resend - Verify Your Email Address',
      html: `
        <h2>Verify Your Email Address</h2>
        <p>Here's a new verification link for your iWorkCore account:</p>
        <a href="${verifyURL}" target="_blank">Verify Email</a>
        <p>This link will expire in 1 hour.</p>
      `,
    });

    res.status(200).json({
      status: 'success',
      message: 'Verification email resent successfully',
    });
  } catch (error) {
    console.error('Resend verification email error:', error);
    res.status(500).json({ status: 'error', message: 'Server error while resending verification email' });
  }
};


// const bcrypt = require('bcryptjs');
// const User = require('../../models/User');
// const { sendEmail } = require('../../utils/email');
// require('dotenv').config();

// // ====================== SEND VERIFICATION EMAIL ======================
// exports.sendVerificationEmail = async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id);

//     if (!user) {
//       return res.status(404).json({
//         status: 'error',
//         message: 'User not found',
//       });
//     }

//     if (user.emailVerified) {
//       return res.status(400).json({
//         status: 'error',
//         message: 'Email is already verified',
//       });
//     }

//     // Generate verification token
//     const verificationToken = user.emailVerificationToken('emailVerificationToken', 60);
//     await user.save({ validateBeforeSave: false });

//     // Construct verification link
//     const verifyURL = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

//     await sendEmail({
//       to: user.email,
//       subject: 'Verify Your Email Address',
//       html: `
//         <h2>Welcome to iWorkCore</h2>
//         <p>Please confirm your email address by clicking the link below:</p>
//         <a href="${verifyURL}" target="_blank">Verify Email</a>
//         <p>This link will expire in 1 hour.</p>
//       `,
//     });

//     res.status(200).json({
//       status: 'success',
//       message: 'Verification email sent successfully',
//     });
//   } catch (error) {
//     console.error('Send verification email error:', error);
//     res.status(500).json({
//       status: 'error',
//       message: 'Server error while sending verification email',
//     });
//   }
// };


// // ====================== VERIFY EMAIL ======================
// exports.verifyEmail = async (req, res) => {
//   try {
//     const { token } = req.params;

//     // Find users whose token is still valid
//     const users = await User.find({
//       emailVerificationExpires: { $gt: Date.now() },
//     });

//     const user = users.find(u =>
//       bcrypt.compareSync(token, u.emailVerificationToken)
//     );

//     if (!user) {
//       return res.status(400).json({
//         status: 'error',
//         message: 'Invalid or expired verification token',
//       });
//     }

//     // Mark as verified
//     user.emailVerified = true;
//     user.emailVerificationToken = undefined;
//     user.emailVerificationExpires = undefined;
//     await user.save({ validateBeforeSave: false });

//     res.status(200).json({
//       status: 'success',
//       message: 'Email verified successfully',
//     });
//   } catch (error) {
//     console.error('Verify email error:', error);
//     res.status(500).json({
//       status: 'error',
//       message: 'Server error while verifying email',
//     });
//   }
// };


// // ====================== RESEND VERIFICATION EMAIL ======================
// exports.resendVerificationEmail = async (req, res) => {
//   try {
//     const { email } = req.body;

//     if (!email) {
//       return res.status(400).json({
//         status: 'error',
//         message: 'Email is required',
//       });
//     }

//     const user = await User.findOne({ email });

//     if (!user) {
//       return res.status(404).json({
//         status: 'error',
//         message: 'No user found with that email address',
//       });
//     }

//     if (user.emailVerified) {
//       return res.status(400).json({
//         status: 'error',
//         message: 'Email is already verified',
//       });
//     }

//     // Generate a fresh token and email
//     const newVerificationToken = user.generateSecureToken('emailVerificationToken', 60);
//     await user.save({ validateBeforeSave: false });

//     const verifyURL = `${process.env.FRONTEND_URL}/auth/verify-email/${newVerificationToken}`;

//     await sendEmail({
//       to: user.email,
//       subject: 'Resend - Verify Your Email Address',
//       html: `
//         <h2>Verify Your Email Address</h2>
//         <p>Here’s a new verification link for your iWorkCore account:</p>
//         <a href="${verifyURL}" target="_blank">Verify Email</a>
//         <p>This link will expire in 1 hour.</p>
//       `,
//     });

//     res.status(200).json({
//       status: 'success',
//       message: 'Verification email resent successfully',
//     });
//   } catch (error) {
//     console.error('Resend verification email error:', error);
//     res.status(500).json({
//       status: 'error',
//       message: 'Server error while resending verification email',
//     });
//   }
// };
