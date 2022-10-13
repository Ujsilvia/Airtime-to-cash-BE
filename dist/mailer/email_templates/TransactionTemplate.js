"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionEmail = void 0;
function TransactionEmail(transactionDetails) {
    let temp = `
                <div style="max-width: 700px;text-align: center; text-transform: uppercase;
                margin:auto; border: 10px solid #ddd; padding: 50px 20px; font-size: 110%;">
                <h2 style="color: teal;">Your transaction details</h2>
                
                <p>${transactionDetails}
                </p>
                
                </div>
                
      `;
    return temp;
}
exports.TransactionEmail = TransactionEmail;
