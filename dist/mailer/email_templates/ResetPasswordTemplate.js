"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordEmail = void 0;
function resetPasswordEmail(token) {
    const link = `${process.env.FRONTEND_URL}/users/verify/${token}`;
    let temp = `
                <div style="max-width: 700px;text-align: center; text-transform: uppercase;
                margin:auto; border: 10px solid #ddd; padding: 50px 20px; font-size: 110%;">
                <h2 style="color: teal;">Verify your email</h2>
                <p>Please Follow the link to reset your password
                </p>
                <div style="text-align:center ;">
                        <a href=${link}
                style="background: #277BC0; text-decoration: none; color: white;
                        padding: 10px 20px; margin: 10px 0;
                display: inline-block;">Click here</a>
                </div>
                </div>
      `;
    return temp;
}
exports.resetPasswordEmail = resetPasswordEmail;
