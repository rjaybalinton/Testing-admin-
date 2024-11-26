const db = require('../config/db'); // Adjust the path to your db configuration if needed
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

const admin = {
    // Add a new post to the blog
    addPost: (req, res) => {
        const { title, content } = req.body;
        const userId = req.user?.id || 1; // Example: Get `user_id` from session or default to 1

        if (!title || !content) {
            return res.status(400).send('Title and content are required');
        }

        const sql = `INSERT INTO posts (title, content, created_at, user_id) VALUES (?, ?, NOW(), ?)`;

        db.query(sql, [title, content, userId], (err, results) => {
            if (err) {
                console.error('Database Error:', err);
                return res.status(500).send(`Internal Server Error: ${err.message}`);
            }

            res.redirect('/');
        });
    },

    // Display all posts on the home page
    home: (req, res) => {
        db.query('SELECT * FROM posts ORDER BY created_at DESC', (err, results) => {
            if (err) {
                return res.status(500).send('Database error');
            }
            res.render('home', { posts: results }); // Pass posts to the view
        });
    },
    visualization: (req, res) => {
        db.query('SELECT * FROM posts ORDER BY created_at DESC', (err, results) => {
            if (err) {
                return res.status(500).send('Database error');
            }
            res.render('home', { posts: results }); // Pass posts to the view
        });
    },

    application: (req, res) => {
        db.query(`
            SELECT s.student_id, s.student_number, s.first_name, s.last_name, s.middle_initial, s.degree_program, 
                   s.year_level, s.gmail, s.phone_number, s.status_enrollment, s.zip_code, s.enrolled_units, 
                   a.status AS application_status
            FROM students s
            LEFT JOIN application_status a ON s.student_id = a.student_id
            WHERE (a.status IS NULL OR a.status NOT IN ('confirmed', 'rejected'))  -- Exclude confirmed and rejected students
        `, (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).send('Database error');
            }
            res.render('application', { students: results });
        });
    },

    // Search for students by student ID or number
    search: (req, res) => {
        const searchQuery = req.query.search;
        const sql = `SELECT * FROM students WHERE student_id = ? OR student_number = ?`;

        db.query(sql, [searchQuery, searchQuery], (err, results) => {
            if (err) {
                return res.status(500).send('Database error');
            }
            res.render('application', { students: results });
        });
    },

    // Add a new student to the database
    addStudent: (req, res) => {
        const newStudent = {
            student_id: req.body.student_id,
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            middle_initial: req.body.middle_initial,
            degree_program: req.body.degree_program,
            year_level: req.body.year_level,
            gmail: req.body.gmail,
            phone_number: req.body.phone_number,
            status_enrollment: req.body.status_enrollment,
            zip_code: req.body.zip_code,
            enrolled_units: req.body.enrolled_units,
        };

        const sql = `INSERT INTO students (student_id, first_name, last_name, middle_initial, degree_program, year_level, gmail, phone_number, status_enrollment, zip_code, enrolled_units) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        db.query(sql, Object.values(newStudent), (err, results) => {
            if (err) {
                console.error('Error adding student:', err);
                return res.status(500).send(`Error adding student: ${err.message}`);
            }
            res.redirect('/application');
        });
    },

    // Confirm a student's application
    confirmStudent: (req, res) => {
        const studentId = req.params.studentId; // Get studentId from route parameters
        
        // Query to get student's current application status from the application_status table
        const queryStatus = `
            SELECT status 
            FROM application_status 
            WHERE student_id = ?
        `;
        
        db.query(queryStatus, [studentId], (err, results) => {
            if (err) {
                console.error('Error retrieving student status:', err);
                return res.status(500).json({ success: false, message: 'Error retrieving student status.' });
            }
            
            // If the student has no application status, insert a new record
            if (results.length === 0) {
                const insertStatusQuery = `
                    INSERT INTO application_status (student_id, status)
                    VALUES (?, 'pending')
                `;
                
                db.query(insertStatusQuery, [studentId], (insertErr) => {
                    if (insertErr) {
                        console.error('Error inserting application status:', insertErr);
                        return res.status(500).json({ success: false, message: 'Error inserting application status.' });
                    }
    
                    // After inserting, proceed with updating the status to confirmed
                    const updateStatusQuery = `
                        UPDATE application_status 
                        SET status = 'confirmed', updated_at = NOW() 
                        WHERE student_id = ?
                    `;
                    
                    db.query(updateStatusQuery, [studentId], (updateErr) => {
                        if (updateErr) {
                            console.error('Error updating status to confirmed:', updateErr);
                            return res.status(500).json({ success: false, message: 'Error confirming student.' });
                        }
    
                        return res.json({
                            success: true,
                            message: 'Student application confirmed successfully!',
                        });
                    });
                });
                return; // Prevent further execution if a new status record was inserted
            }
    
            // If status already exists, check if it's confirmed
            const currentStatus = results[0].status;
    
            if (currentStatus === 'confirmed') {
                // If the status is already confirmed, send it to the view
                return res.json({
                    success: false,
                    message: 'Student application is already confirmed.',
                });
            }
    
            // If not confirmed, update the status to 'confirmed'
            const updateQuery = `
                UPDATE application_status 
                SET status = 'confirmed', updated_at = NOW() 
                WHERE student_id = ?
            `;
            
            db.query(updateQuery, [studentId], (updateErr) => {
                if (updateErr) {
                    console.error('Error updating status to confirmed:', updateErr);
                    return res.status(500).json({ success: false, message: 'Error confirming student.' });
                }
    
                return res.json({
                    success: true,
                    message: 'Student application confirmed successfully!',
                });
            });
        });
    },
// Reject a student's application
rejectStudent: (req, res) => {
    const studentId = req.params.studentId; // Get studentId from route parameters

    // Query to check if the student has a status in the application_status table
    const queryStatus = `
        SELECT status 
        FROM application_status 
        WHERE student_id = ?
    `;

    db.query(queryStatus, [studentId], (err, results) => {
        if (err) {
            console.error('Error retrieving student status:', err);
            return res.status(500).json({ success: false, message: 'Error retrieving student status.' });
        }

        // If the student has no application status, insert a new record
        if (results.length === 0) {
            const insertStatusQuery = `
                INSERT INTO application_status (student_id, status)
                VALUES (?, 'pending')
            `;

            db.query(insertStatusQuery, [studentId], (insertErr) => {
                if (insertErr) {
                    console.error('Error inserting application status:', insertErr);
                    return res.status(500).json({ success: false, message: 'Error inserting application status.' });
                }

                // After inserting, proceed with updating the status to rejected
                const updateStatusQuery = `
                    UPDATE application_status 
                    SET status = 'rejected', updated_at = NOW() 
                    WHERE student_id = ?
                `;

                db.query(updateStatusQuery, [studentId], (updateErr) => {
                    if (updateErr) {
                        console.error('Error updating status to rejected:', updateErr);
                        return res.status(500).json({ success: false, message: 'Error rejecting student.' });
                    }

                    return res.json({
                        success: true,
                        message: 'Student application rejected successfully!',
                    });
                });
            });

            return; // Prevent further execution if a new status record was inserted
        }

        // If status already exists, check if it's already rejected
        const currentStatus = results[0].status;

        if (currentStatus === 'rejected') {
            // If the status is already rejected, send it to the view
            return res.json({
                success: false,
                message: 'Student application is already rejected.',
            });
        }

        // If not rejected, update the status to 'rejected'
        const updateQuery = `
            UPDATE application_status 
            SET status = 'rejected', updated_at = NOW() 
            WHERE student_id = ?
        `;

        db.query(updateQuery, [studentId], (updateErr) => {
            if (updateErr) {
                console.error('Error updating status to rejected:', updateErr);
                return res.status(500).json({ success: false, message: 'Error rejecting student.' });
            }

            return res.json({
                success: true,
                message: 'Student application rejected successfully!',
            });
        });
    });
},


    // Fetch all confirmed students
    getConfirmedStudents: (req, res) => {
        const query = `
            SELECT s.student_id, s.first_name, s.last_name, s.degree_program, s.year_level, 
                   s.gmail, s.phone_number, a.updated_at
            FROM students s
            INNER JOIN application_status a ON s.student_id = a.student_id
            WHERE a.status = 'confirmed'
            ORDER BY a.updated_at DESC
        `;
        db.query(query, (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error retrieving confirmed students.');
            }
            res.render('confirmed', { students: results });
        });
    },

    // Fetch pending applications
   // getPendingApplications: (req, res) => {
      //  const query = `
     //       SELECT s.student_id, s.first_name, s.last_name, s.degree_program, s.year_level, s.gmail, s.phone_number
      //      FROM students s
    //        INNER JOIN application_status a ON s.student_id = a.student_id
     //       WHERE a.status = 'pending'
     //       ORDER BY a.updated_at DESC`;

      //  db.query(query, (err, results) => {
       //     if (err) {
       //         console.error(err);
      //          return res.status(500).send('Error retrieving pending applications.');
       //     }
       //     res.render('application', { students: results });
      //  });
 //   },
//}, // Fetch all rejected students
    getRejectedStudents: (req, res) => {
        const query = `
            SELECT s.student_id, s.first_name, s.last_name, s.degree_program, s.year_level, 
                   s.gmail, s.phone_number, a.updated_at
            FROM students s
            INNER JOIN application_status a ON s.student_id = a.student_id
            WHERE a.status = 'rejected'
            ORDER BY a.updated_at DESC
        `;
        db.query(query, (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error retrieving rejected students.');
            }
            res.render('rejected', { students: results });
        });
    },
    exportConfirmedStudents: (req, res) => {
        const query = `
            SELECT s.student_id, s.first_name, s.last_name, s.degree_program, s.year_level, 
                   s.gmail, s.phone_number, a.updated_at
            FROM students s
            INNER JOIN application_status a ON s.student_id = a.student_id
            WHERE a.status = 'confirmed'
            ORDER BY a.updated_at DESC
        `;
    
        db.query(query, (err, results) => {
            if (err) {
                console.error('Database Error:', err);
                return res.status(500).send('Error retrieving confirmed students.');
            }
    
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Confirmed Students');
    
            // Add headers
            worksheet.columns = [
                { header: 'Student ID', key: 'student_id', width: 15 },
                { header: 'First Name', key: 'first_name', width: 20 },
                { header: 'Last Name', key: 'last_name', width: 20 },
                { header: 'Degree Program', key: 'degree_program', width: 30 },
                { header: 'Year Level', key: 'year_level', width: 10 },
                { header: 'Gmail', key: 'gmail', width: 25 },
                { header: 'Phone Number', key: 'phone_number', width: 15 },
                { header: 'Updated At', key: 'updated_at', width: 20 },
            ];
    
            // Add rows to worksheet
            worksheet.addRows(results);
    
            // Ensure the exports directory exists
            const exportsDir = path.join(__dirname, '../exports');
            if (!fs.existsSync(exportsDir)) {
                fs.mkdirSync(exportsDir);
            }
    
            // File path for the exported file
            const filePath = path.join(exportsDir, 'confirmed_students.xlsx');
    
            // Write the Excel file
            workbook.xlsx
                .writeFile(filePath)
                .then(() => {
                    // Send the file for download
                    res.download(filePath, 'confirmed_students.xlsx', (downloadErr) => {
                        if (downloadErr) {
                            console.error('Error sending file:', downloadErr);
                            return res.status(500).send('Error downloading file.');
                        }
    
                        // Delete the file after successful download
                        fs.unlink(filePath, (unlinkErr) => {
                            if (unlinkErr) {
                                console.error('Error deleting file:', unlinkErr);
                            }
                        });
                    });
                })
                .catch((writeErr) => {
                    console.error('Error writing Excel file:', writeErr);
                    res.status(500).send('Error exporting file.');
                });
        });
    },
    renderVisualizationPage: (req, res) => {
        // Query to get the count of confirmed students per year level
        const yearLevelQuery = `
            SELECT s.year_level, COUNT(*) AS count
            FROM students s
            INNER JOIN application_status a ON s.student_id = a.student_id
            WHERE a.status = 'confirmed'
            GROUP BY s.year_level
        `;
    
        // Query to get the count of confirmed students per degree program
        const degreeProgramQuery = `
            SELECT s.degree_program, COUNT(*) AS count
            FROM students s
            INNER JOIN application_status a ON s.student_id = a.student_id
            WHERE a.status = 'confirmed'
            GROUP BY s.degree_program
        `;
    
        // Run the year level query
        db.query(yearLevelQuery, (err, yearResults) => {
            if (err) {
                console.error('Error fetching year level data:', err);
                return res.status(500).send('Database error');
            }
    
            // Run the degree program query
            db.query(degreeProgramQuery, (err, degreeResults) => {
                if (err) {
                    console.error('Error fetching degree program data:', err);
                    return res.status(500).send('Database error');
                }
    
                // Total number of confirmed students for percentage calculation
                const totalStudents = yearResults.reduce((sum, result) => sum + result.count, 0);
    
                if (totalStudents === 0) {
                    console.warn('No confirmed students found in the database');
                    return res.render('visualization', {
                        title: 'Data Visualization',
                        yearLevelLabels: [],
                        yearLevelData: [],
                        degreeProgramLabels: [],
                        degreeProgramData: [],
                    });
                }
    
                // Calculate the percentages for year level
                const yearLevelLabels = yearResults.map(result => `Year ${result.year_level}`);
                const yearLevelData = yearResults.map(result => (result.count / totalStudents) * 100);
    
                // Calculate the percentages for degree program
                const degreeProgramLabels = degreeResults.map(result => result.degree_program);
                const degreeProgramData = degreeResults.map(result => (result.count / totalStudents) * 100);
    
                // Render the visualization page with both sets of data
                res.render('visualization', {
                    title: 'Data Visualization (Confirmed Students)',
                    yearLevelLabels,
                    yearLevelData,
                    degreeProgramLabels,
                    degreeProgramData,
                });
            });
        });
    
    }
    };

module.exports = admin;

