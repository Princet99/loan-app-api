<<<<<<< HEAD
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();
const PORT = 3000;

app.use(cors());

// MySQL Connection Configuration
const db = mysql.createConnection({
  host: "mysql-2bbcdfdb-pt1133557799-2a53.i.aivencloud.com",
  user: "avnadmin",
  password: "AVNS_Ku3parC4UCB1ASatwR7",
  database: "loan",
  port: 13879,
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err.message);
    return;
  }
  console.log("Connected to MySQL database");
});

// Route to fetch "My Loans" for User 2
app.get("/my-loans/:userId", (req, res) => {
  const userId = req.params.userId;

  // SQL Query for the loans
  const loanQuery = `
    SELECT 
      LUT.luid AS LoanUserID,
      LUT.lnno AS LoanNumber,
      LUT.luloan_name AS LoanDescription,
      LUT.lurole AS UserRole,
      LT.lndate AS LoanDate,
      LT.lnstatus AS LoanStatus,
      LT.lnamount AS LoanAmount,
      LT.lnrate AS LoanRate,
      LT.lnfee AS LoanFee,
      LT.lnscore AS LoanScore,
      LT.lnmemo AS LoanMemo
    FROM 
      LoanUserTable LUT
    INNER JOIN 
      LoanTable LT
      ON LUT.lnno = LT.lnno
    WHERE 
      LUT.usid = ?;`;

  // SQL Query for payment statistics
  const paymentStatsQuery = `
    SELECT 
      sc.lnno AS LoanNumber,
      SUM(CASE WHEN sc.scstatus = 'On time' THEN 1 ELSE 0 END) AS onTimeCount,
      SUM(CASE WHEN sc.scstatus = 'On time' THEN sc.scpaid ELSE 0 END) AS onTimeAmount,
      SUM(CASE WHEN sc.scstatus LIKE 'Late%' THEN 1 ELSE 0 END) AS lateCount,
      SUM(CASE WHEN sc.scstatus LIKE 'Late%' THEN sc.scpaid ELSE 0 END) AS lateAmount,
      SUM(CASE WHEN sc.scstatus = 'Future' THEN 1 ELSE 0 END) AS futureCount,
      SUM(CASE WHEN sc.scstatus = 'Future' THEN sc.scamount ELSE 0 END) AS futureAmount,
      SUM(sc.scbalance) AS currentBalance
    FROM 
      ScheduleTable sc
    GROUP BY 
      sc.lnno;`;

  // SQL Query for recent payments
  const recentPaymentsQuery = `
    SELECT 
      p.lnno AS LoanNumber,
      s.scdate AS ScheduledDate,
      p.pmdate AS ActualDate,
      p.pmpaid AS Amount,
      p.pmstatus AS Status
    FROM 
      PaymentTable p
    INNER JOIN 
      ScheduleTable s ON p.scid = s.scid
    ORDER BY 
      p.pmdate DESC
    LIMIT 5;`;

  // Execute all queries and combine the results
  db.query(loanQuery, [userId], (err, loans) => {
    if (err) {
      console.error("Error fetching loans:", err.message);
      return res.status(500).send("Error fetching loans.");
    }

    db.query(paymentStatsQuery, (err, paymentStats) => {
      if (err) {
        console.error("Error fetching payment stats:", err.message);
        return res.status(500).send("Error fetching payment stats.");
      }

      db.query(recentPaymentsQuery, (err, recentPayments) => {
        if (err) {
          console.error("Error fetching recent payments:", err.message);
          return res.status(500).send("Error fetching recent payments.");
        }

        // Combine data
        const response = loans.map((loan) => {
          const stats =
            paymentStats.find((p) => p.LoanNumber === loan.LoanNumber) || {};
          const payments = recentPayments.filter(
            (p) => p.LoanNumber === loan.LoanNumber
          );

          return {
            ...loan,
            onTimePayments: {
              number: stats.onTimeCount || 0,
              amount: stats.onTimeAmount || 0,
              points: stats.onTimeAmount || 0, // Modify point calculation logic if needed
            },
            latePayments: {
              number: stats.lateCount || 0,
              amount: stats.lateAmount || 0,
              points: (stats.lateAmount || 0) * 0.5, // Example point calculation
            },
            futurePayments: {
              number: stats.futureCount || 0,
              amount: stats.futureAmount || 0,
              points: stats.futureAmount || 0,
            },
            total: {
              number:
                (stats.onTimeCount || 0) +
                (stats.lateCount || 0) +
                (stats.futureCount || 0),
              amount:
                (stats.onTimeAmount || 0) +
                (stats.lateAmount || 0) +
                (stats.futureAmount || 0),
              points:
                (stats.onTimeAmount || 0) +
                (stats.lateAmount || 0) * 0.5 +
                (stats.futureAmount || 0), // Example calculation
            },
            currentBalance: stats.currentBalance || 0,
            upcomingPayment: {
              amount: stats.futureAmount || 0, // Replace with actual next due payment
              dueDate: null, // Replace with actual next due date
            },
            recentPayments: payments.map((p) => ({
              scheduled: p.ScheduledDate,
              actual: p.ActualDate,
              amount: p.Amount,
              status: p.Status,
            })),
          };
        });

        res.json(response);
      });
    });
  });
});

// Start the Express Server
app.listen(PORT, () => {
  const serverUrl = process.env.DOMAIN || `http://localhost:${PORT}`; // Use DOMAIN environment variable
  console.log(`Server is running on ${serverUrl}`);
});

app.use(express.static("build"));

process.on("SIGINT", () => {
  db.end(() => {
    console.log("MySQL connection closed.");
    process.exit();
  });
});
=======
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();
const PORT = 3000;

app.use(cors());

// MySQL Connection Configuration
const db = mysql.createConnection({
  host: "mysql-2bbcdfdb-pt1133557799-2a53.i.aivencloud.com",
  user: "avnadmin",
  password: "AVNS_Ku3parC4UCB1ASatwR7",
  database: "loan",
  port: 13879,
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err.message);
    return;
  }
  console.log("Connected to MySQL database");
});

const DEFAULT_DATE = "2025-05-10"; // Set the default date

// Route to fetch "My Loans" for a specific user
app.get("/my-loans/:userId", (req, res) => {
  const userId = req.params.userId;

  // Query to fetch loans
  const loanQuery = `
    SELECT 
      LUT.luid AS LoanUserID,
      LUT.lnno AS LoanNumber,
      LUT.luloan_name AS LoanDescription,
      LUT.lurole AS UserRole,
      LT.lndate AS LoanDate,
      LT.lnstatus AS LoanStatus,
      LT.lnamount AS LoanAmount,
      LT.lnrate AS LoanRate,
      LT.lnfee AS LoanFee,
      LT.lnscore AS LoanScore,
      LT.lnmemo AS LoanMemo
    FROM 
      LoanUserTable LUT
    INNER JOIN 
      LoanTable LT
      ON LUT.lnno = LT.lnno
    WHERE 
      LUT.usid = ?;`;

  const paymentStatsQuery = `
    SELECT 
      sc.lnno AS LoanNumber,
      (SELECT scbalance
       FROM ScheduleTable sc2
       WHERE sc2.lnno = sc.lnno
         AND sc2.scdate > '${DEFAULT_DATE}'
       ORDER BY sc2.scdate ASC
       LIMIT 1) AS currentBalance,
      (
        SELECT scamount 
        FROM ScheduleTable sc2
        WHERE sc2.lnno = sc.lnno
          AND sc2.scdate > '${DEFAULT_DATE}'
        ORDER BY sc2.scdate ASC
        LIMIT 1
      ) +
      SUM(CASE WHEN sc.scdate < '${DEFAULT_DATE}' THEN sc.scdue ELSE 0 END) AS amountDue,
      (SELECT scdate
       FROM ScheduleTable sc2
       WHERE sc2.lnno = sc.lnno
         AND sc2.scdate > '${DEFAULT_DATE}'
       ORDER BY sc2.scdate ASC
       LIMIT 1) AS dueDate
    FROM 
      ScheduleTable sc
    GROUP BY 
      sc.lnno;
  `;

  const paymentDataQuery = `
     SELECT 
    lnno AS LoanNumber,
    SUM(CASE WHEN pmstatus = 'On time' THEN pmpaid ELSE 0 END) AS OnTimeAmount,
    SUM(CASE WHEN pmstatus LIKE 'Late%' THEN pmpaid ELSE 0 END) AS LateAmount,
    COUNT(CASE WHEN pmstatus = 'On time' THEN 1 END) AS OnTimeCount,
    COUNT(CASE WHEN pmstatus LIKE 'Late%' THEN 1 END) AS LateCount
FROM 
    PaymentTable
WHERE 
    pmpayor = 'borrower'
    AND pmdate <= '${DEFAULT_DATE}'
GROUP BY 
    lnno;
  `;

  const actualPaymentsQuery = `
    SELECT 
      p.lnno AS LoanNumber,
      DATE_FORMAT(p.pmdate, '%d/%m/%Y') AS ActualDate, 
      COALESCE(p.pmpaid, 0) AS PaidAmount,                
      p.pmstatus AS Status                                
    FROM 
      PaymentTable p
    WHERE 
      p.pmdate <= '${DEFAULT_DATE}'                     
    ORDER BY 
      p.pmdate DESC                                      
    LIMIT 4;
  `;

  const scheduledPaymentsQuery = `
    SELECT 
    s.lnno AS LoanNumber,
    DATE_FORMAT(s.scdate, '%d/%m/%Y') AS ScheduledDate, 
    s.scamount AS scheduledPaidAmount
FROM 
    ScheduleTable s
WHERE 
    s.scdate <= '${DEFAULT_DATE}' AND s.scpaid IS NOT NULL
ORDER BY 
    s.scdate DESC
LIMIT 4;
  `;

  // Execute all queries and combine results
  db.query(loanQuery, [userId], (err, loans) => {
    if (err) {
      console.error("Error fetching loans:", err.message);
      return res.status(500).send({ error: "Error fetching loans" });
    }

    db.query(paymentStatsQuery, (err, paymentStats) => {
      if (err) {
        console.error("Error fetching payment stats:", err.message);
        return res.status(500).send({ error: "Error fetching payment stats" });
      }

      db.query(paymentDataQuery, (err, paymentData) => {
        if (err) {
          console.error("Error fetching payment data:", err.message);
          return res.status(500).send({ error: "Error fetching payment data" });
        }

        db.query(actualPaymentsQuery, (err, actualPayments) => {
          if (err) {
            console.error("Error fetching actual payments:", err.message);
            return res
              .status(500)
              .send({ error: "Error fetching actual payments" });
          }

          db.query(scheduledPaymentsQuery, (err, scheduledPayments) => {
            if (err) {
              console.error("Error fetching scheduled payments:", err.message);
              return res
                .status(500)
                .send({ error: "Error fetching scheduled payments" });
            }

            const combinedPayments = [];

            scheduledPayments.forEach((scheduled, index) => {
              // Get corresponding actual payment from the actualPayments array without any comparison or matching
              const actualPayment = actualPayments[index];

              // Combine data from both objects and add status from actualPayments
              combinedPayments.push({
                ScheduledDate: scheduled.ScheduledDate,
                scheduledPaidAmount: scheduled.scheduledPaidAmount, // Keep as raw value
                ActualDate: actualPayment?.ActualDate || null, // If actualPayment exists, use ActualDate, otherwise null
                PaidAmount: actualPayment?.PaidAmount || null, // If actualPayment exists, use PaidAmount, otherwise null
                Status: actualPayment?.Status || "Pending", // Default to "Pending" if no status
              });
            });

            // Combine the rest of the data into the response
            const response = loans.map((loan) => {
              const stats =
                paymentStats.find((p) => p.LoanNumber === loan.LoanNumber) ||
                {};
              const payments =
                paymentData.find((p) => p.LoanNumber === loan.LoanNumber) || {};

              return {
                ...loan,
                onTimePayments: {
                  number: payments.OnTimeCount || 0,
                  amount: payments.OnTimeAmount || 0,
                },
                latePayments: {
                  number: payments.LateCount || 0,
                  amount: payments.LateAmount || 0,
                },
                currentBalance: stats.currentBalance || 0,
                amountDue: stats.amountDue || 0,
                dueDate: stats.dueDate || null,
                recentPayments: combinedPayments,
              };
            });

            res.json(response);
          });
        });
      });
    });
  });
});

app.use(express.static("build"));

// Start Express Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Close MySQL connection on termination
process.on("SIGINT", () => {
  db.end(() => {
    console.log("MySQL connection closed.");
    process.exit();
  });
});
>>>>>>> d3a3759 (This is updated working Model)
