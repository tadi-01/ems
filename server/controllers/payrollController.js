import Employee from "../models/Employee.js";
import Payroll from "../models/Payroll.js";
import getEmployeeForUser from "../utils/getEmployeeForUser.js";
import { isValidMonth, readPayslipAmounts } from "../utils/payrollHelpers.js";

// The employee fields shown on a payslip. Used with populate so the payslip
// holds the employee's name instead of only an id.
const employeeFields = "name employeeId designation";

// Creates the payslip for one employee and month (Admin or HR). The server
// works out the net salary and the unique index blocks a second payslip for
// the same employee and month.
async function createPayslip(request, response) {
  try {
    const { employee: employeeId, month } = request.body;
    if (!isValidMonth(month)) {
      response.status(400).json({ message: "Month must look like 2026-10." });
      return;
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      response.status(404).json({ message: "Employee not found." });
      return;
    }

    const result = readPayslipAmounts(request.body, employee.salary);
    if (result.error) {
      response.status(400).json({ message: result.error });
      return;
    }

    const payslip = await Payroll.create({
      employee: employee._id,
      month,
      ...result.amounts,
      createdBy: request.user.userId,
      companyName: process.env.COMPANY_NAME || "",
      currency: process.env.PAYROLL_CURRENCY || "",
    });
    response.status(201).json(await payslip.populate("employee", employeeFields));
  } catch (error) {
    if (error.code === 11000) {
      response.status(400).json({
        message: "A payslip for this employee and month already exists.",
      });
      return;
    }
    response.status(500).json({ message: "Could not create payslip." });
  }
}

// Changes the amounts on an existing payslip and works out the net salary again.
// The employee and month cannot be changed; delete and create a new payslip instead.
async function updatePayslip(request, response) {
  try {
    const payslip = await Payroll.findById(request.params.id);
    if (!payslip) {
      response.status(404).json({ message: "Payslip not found." });
      return;
    }

    const result = readPayslipAmounts(request.body, payslip.basicSalary);
    if (result.error) {
      response.status(400).json({ message: result.error });
      return;
    }

    Object.assign(payslip, result.amounts);
    payslip.updatedBy = request.user.userId;
    await payslip.save();
    response.json(await payslip.populate("employee", employeeFields));
  } catch (error) {
    response.status(400).json({ message: "Could not update payslip." });
  }
}

// Deletes a payslip, for example one that was made for the wrong month.
async function deletePayslip(request, response) {
  try {
    const payslip = await Payroll.findByIdAndDelete(request.params.id);
    if (!payslip) {
      response.status(404).json({ message: "Payslip not found." });
      return;
    }
    response.json({ message: "Payslip deleted." });
  } catch (error) {
    response.status(400).json({ message: "Could not delete payslip." });
  }
}

// Returns all payslips for Admin or HR. An optional ?month= value such as
// 2026-10 shows only that month.
async function getAllPayslips(request, response) {
  try {
    const filter = request.query.month ? { month: request.query.month } : {};
    const payslips = await Payroll.find(filter)
      .populate("employee", employeeFields)
      .sort({ month: -1, createdAt: -1 });
    response.json(payslips);
  } catch (error) {
    response.status(500).json({ message: "Could not load payslips." });
  }
}

// Returns only the logged-in employee's own payslips, newest month first.
async function getMyPayslips(request, response) {
  try {
    const employee = await getEmployeeForUser(request);
    if (!employee) {
      response
        .status(404)
        .json({ message: "Ask Admin or HR to link your account on the Employees page." });
      return;
    }

    const payslips = await Payroll.find({ employee: employee._id })
      .populate("employee", employeeFields)
      .sort({ month: -1 });
    response.json(payslips);
  } catch (error) {
    response.status(500).json({ message: "Could not load your payslips." });
  }
}

export {
  createPayslip,
  updatePayslip,
  deletePayslip,
  getAllPayslips,
  getMyPayslips,
};
