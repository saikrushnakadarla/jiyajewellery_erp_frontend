import React, { useState, useEffect } from 'react';
import baseURL from '../../../Url/NodeBaseURL';

const AccountBalanceTable = () => {
    const [accountData, setAccountData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${baseURL}/get-unique-repair-details`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();

                // Process the data to combine duplicates and sum balances
                const processedData = processAccountData(data);
                setAccountData(processedData);
                setLoading(false);
            } catch (error) {
                setError(error.message);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    //   const processAccountData = (data) => {
    //     const accountMap = new Map();

    //     data.forEach(item => {
    //       const accountName = item.account_name;
    //       const balanceAmount = parseFloat(item.bal_amt) || 0;

    //       if (accountMap.has(accountName)) {
    //         // If account exists, add to its balance
    //         const existing = accountMap.get(accountName);
    //         accountMap.set(accountName, {
    //           ...existing,
    //           balanceAmount: existing.balanceAmount + balanceAmount
    //         });
    //       } else {
    //         // If new account, add to map
    //         accountMap.set(accountName, {
    //           accountName,
    //           balanceAmount
    //         });
    //       }
    //     });

    //     // Convert map values to array and sort by balance amount (descending)
    //     return Array.from(accountMap.values()).sort((a, b) => 
    //       b.balanceAmount - a.balanceAmount
    //     );
    //   };

    const processAccountData = (data) => {
        const accountMap = new Map();

        data.forEach(item => {
            const originalName = item.account_name || '';
            const normalizedName = originalName.toLowerCase(); // Case-insensitive key

            // Calculate balance amount using your logic
            const bal_amt = Number(item.bal_amt) || 0;
            const bal_after_receipts = Number(item.bal_after_receipts) || 0;
            const receipts_amt = Number(item.receipts_amt) || 0;

            // If bal_amt equals receipts_amt, use bal_after_receipts
            const balanceAmount = bal_amt === receipts_amt ? bal_after_receipts : bal_after_receipts || bal_amt;

            if (accountMap.has(normalizedName)) {
                const existing = accountMap.get(normalizedName);
                accountMap.set(normalizedName, {
                    ...existing,
                    balanceAmount: existing.balanceAmount + balanceAmount
                });
            } else {
                accountMap.set(normalizedName, {
                    accountName: originalName.toUpperCase(), // Convert to UPPERCASE for display
                    balanceAmount
                });
            }
        });

        // Sort by balance amount in descending order (highest at top)
        return Array.from(accountMap.values()).sort((a, b) =>
            b.balanceAmount - a.balanceAmount
        );
    };


    if (loading) {
        return <div style={{ padding: '10px', textAlign: 'center' }}>Loading...</div>;
    }

    if (error) {
        return <div style={{ padding: '10px', color: 'red', textAlign: 'center' }}>Error: {error}</div>;
    }

    return (
        <div style={{
            height: '180px',
            overflowY: 'auto',
            width: '100%',
            marginTop: '8px'
        }}>
            <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '13px'
            }}>
                <thead>
                    <tr style={{
                        backgroundColor: '#f5f5f5',
                        position: 'sticky',
                        top: 0
                    }}>
                        <th style={{
                            padding: '6px 10px',
                            textAlign: 'left',
                            borderBottom: '1px solid #ddd',
                            fontWeight: '600', color: "#b77318"
                        }}>Account Name</th>
                        <th style={{
                            padding: '6px 10px',
                            textAlign: 'right',
                            borderBottom: '1px solid #ddd',
                            fontWeight: '600', color: "#b77318"
                        }}>Balance Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {accountData.map((account, index) => (
                        <tr key={index} style={{
                            borderBottom: '1px solid #eee',
                            ':hover': { backgroundColor: '#f9f9f9' }
                        }}>
                            <td style={{
                                padding: '6px 10px',
                                textAlign: 'left',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                maxWidth: '120px'
                            }}>{account.accountName}</td>
                            <td style={{
                                padding: '6px 10px',
                                textAlign: 'right',
                                color: account.balanceAmount < 0 ? '#d32f2f' : '#388e3c',
                                fontWeight: '500'
                            }}>
                                {
                                    new Intl.NumberFormat('en-IN', {
                                        style: 'currency',
                                        currency: 'INR',
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })
                                        .format(account.balanceAmount)
                                        .replace(/^[^\d]+/, '')  // Removes ₹ symbol
                                }
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AccountBalanceTable;