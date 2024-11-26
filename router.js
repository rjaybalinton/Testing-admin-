const express = require('express');
const router = express.Router();
const admin = require('../controller/admin');

// Route for the home page
router.get('/', admin.home);

// Route for the application page (student applications)
router.get('/application', admin.application);

// Route for the profile page
//router.get('/profile', admin.profile);

// Route for searching students
router.get('/search', admin.search);

// Route for adding a new student
router.post('/addStudent', admin.addStudent);

// Route for adding a new post
router.post('/addPost', admin.addPost);

// Confirm student route (with student ID)
router.post('/confirmStudent/:studentId', admin.confirmStudent);

router.post('/confirm/:studentId', admin.confirmStudent);
// Reject student route (with student ID)
router.post('/rejectStudent/:studentId', admin.rejectStudent);

// Route for confirmed students (list of all confirmed students)
router.get('/confirmed', admin.getConfirmedStudents);

// Route for rejected students (list of all rejected students)
router.get('/rejected', admin.getRejectedStudents);

//Route for exporting the data of all confirmed students to excel files
router.get('/export/confirmed-students', admin.exportConfirmedStudents);

// Route for rendering the visualization page
router.get('/visualization', admin.renderVisualizationPage);

module.exports = router;
