const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');

// Employee routes
router.get('/employees/:id', scheduleController.getEmployeeInfo);
router.put('/employees/:id', scheduleController.updateEmployeeInfo);
router.get('/employees/:id/schedules', scheduleController.getEmployeeSchedule);
router.get('/employees/:id/report', scheduleController.getMonthlyReport);
router.get('/employees/:id/requests', scheduleController.getEmployeeRequests);
router.post('/requests', scheduleController.createRequest);

// Manager routes
router.get('/employees', scheduleController.getAllEmployees);
router.get('/schedules', scheduleController.getAllSchedules);
router.post('/schedules', scheduleController.createSchedule);
router.delete('/schedules/:id', scheduleController.deleteSchedule);
router.get('/requests', scheduleController.getAllRequests);
router.patch('/requests/:id/approve', scheduleController.approveRequest);

// Attendance routes
router.patch('/schedules/:id/attendance', scheduleController.markAttendance);
router.post('/schedules/bulk-attendance', scheduleController.markBulkAttendance);

module.exports = router;
