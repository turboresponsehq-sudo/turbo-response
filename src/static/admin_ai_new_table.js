// Render cases table
function renderCasesTable() {
    const tbody = document.getElementById('casesTableBody');
    
    if (cases.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; color: var(--text-muted);">
                    No cases found
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = cases.map(case_ => {
        // Fix data mapping - handle both old and new data structures
        const clientData = case_.client_data || {};
        const contactInfo = case_.contact_info || {};
        const caseDetails = case_.case_details || {};
        
        const fullName = clientData.fullName || contactInfo.fullName || 'N/A';
        const email = clientData.email || contactInfo.email || 'N/A';
        const category = clientData.category || caseDetails.category || 'N/A';
        const description = clientData.caseDescription || caseDetails.description || 'N/A';
        
        // Simplify payment status display
        let paymentStatusText = 'Not Paid';
        let paymentStatusClass = 'pending';
        if (case_.payment_status === 'paid') {
            paymentStatusText = 'Paid';
            paymentStatusClass = 'paid';
        } else if (case_.payment_status === 'partial') {
            paymentStatusText = 'Partial Payment';
            paymentStatusClass = 'partial';
        }
        
        return `
            <tr>
                <td><strong>${fullName}</strong></td>
                <td>${email}</td>
                <td><span class="category-badge">${category}</span></td>
                <td>${description.length > 50 ? description.substring(0, 50) + '...' : description}</td>
                <td><span class="status-badge status-${paymentStatusClass}">${paymentStatusText}</span></td>
                <td><span class="status-badge status-${case_.status || 'submitted'}">${case_.status || 'Submitted'}</span></td>
                <td>${case_.timestamp ? new Date(case_.timestamp).toLocaleDateString() : 'N/A'}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-primary btn-sm" onclick="viewCase('${case_.case_id}')">👁️ View</button>
                        ${case_.payment_status !== 'paid' && !case_.payment_link ? 
                            `<button class="btn btn-primary btn-sm" onclick="generatePaymentLink('${case_.case_id}')">💳 Link</button>` : 
                            ''
                        }
                        ${case_.payment_link && case_.payment_link.status === 'pending' ? 
                            `<button class="btn btn-secondary btn-sm" onclick="copyPaymentLink('${case_.payment_link.token}')">📋 Copy</button>` : 
                            ''
                        }
                        ${case_.payment_status !== 'paid' ? 
                            `<button class="btn btn-success btn-sm" onclick="markPaid('${case_.case_id}')">✅ Paid</button>` : 
                            ''
                        }
                        ${case_.status !== 'archived' ? 
                            `<button class="btn btn-secondary btn-sm" onclick="archiveCase('${case_.case_id}')">📦 Archive</button>` : 
                            `<button class="btn btn-secondary btn-sm" onclick="unarchiveCase('${case_.case_id}')">📤 Unarchive</button>`
                        }
                        <button class="btn btn-danger btn-sm" onclick="deleteCase('${case_.case_id}')">🗑️ Delete</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

