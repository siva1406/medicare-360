import { Department } from '../models/Department.js';
import { DoctorProfile } from '../models/DoctorProfile.js';

export const getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find().sort({ name: 1 });
    
    // Get doctor counts and senior consultants for each department
    const deptStats = await Promise.all(
      departments.map(async (d) => {
        const doctorCount = await DoctorProfile.countDocuments({ departmentId: d._id });
        const seniorDoc = await DoctorProfile.findOne({ departmentId: d._id }).populate('userId', 'name');
        return {
          _id: d._id,
          id: d._id,
          name: d.name,
          description: d.description,
          icon: d.icon,
          doctorCount,
          doctorsCount: doctorCount,
          head: seniorDoc?.userId?.name || 'Dr. Senior Consultant, MD',
          createdAt: d.createdAt
        };
      })
    );

    res.json({
      success: true,
      departments: deptStats
    });
  } catch (err) {
    next(err);
  }
};

export const getDepartmentById = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    const doctors = await DoctorProfile.find({ departmentId: department._id })
      .populate('userId', 'name email phone avatar');

    res.json({
      success: true,
      department: {
        ...department.toObject(),
        doctors
      }
    });
  } catch (err) {
    next(err);
  }
};

export const createDepartment = async (req, res, next) => {
  try {
    const { name, description, icon } = req.body;
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Department name is required'
      });
    }

    const existing = await Department.findOne({ name: name.trim() });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Department with this name already exists'
      });
    }

    const department = await Department.create({
      name: name.trim(),
      description: description || '',
      icon: icon || 'Activity'
    });

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      department
    });
  } catch (err) {
    next(err);
  }
};

export const updateDepartment = async (req, res, next) => {
  try {
    const { name, description, icon } = req.body;
    const department = await Department.findByIdAndUpdate(
      req.params.id,
      {
        ...(name && { name: name.trim() }),
        ...(description !== undefined && { description }),
        ...(icon && { icon })
      },
      { new: true }
    );

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    res.json({
      success: true,
      message: 'Department updated successfully',
      department
    });
  } catch (err) {
    next(err);
  }
};

export const deleteDepartment = async (req, res, next) => {
  try {
    const doctorCount = await DoctorProfile.countDocuments({ departmentId: req.params.id });
    if (doctorCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete department: ${doctorCount} doctors are assigned to this department.`
      });
    }

    const department = await Department.findByIdAndDelete(req.params.id);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    res.json({
      success: true,
      message: 'Department deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};
