const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const mongoose = require('mongoose'); // Import mongoose for ObjectId validation

// Create a new group
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Group name is required' });
    }

    const newGroup = new Group({ name });
    const savedGroup = await newGroup.save();
    res.status(201).json(savedGroup);
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ message: 'Failed to create group', error: error.message });
  }
});

// Get all groups
router.get('/', async (req, res) => {
  try {
    const groups = await Group.find();
    res.json(groups);
  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(500).json({ message: 'Failed to fetch groups' });
  }
});

// Get a specific group by ID
router.get('/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;

    // Validate groupId format
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ message: 'Invalid groupId format' });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    res.json(group);
  } catch (error) {
    console.error('Error fetching group:', error.message);
    res.status(500).json({ message: 'Failed to fetch group', error: error.message });
  }
});

// Assign a farmer to a group
router.post('/:groupId/assign-farmer', async (req, res) => {
  try {
    const { groupId } = req.params;
    const { farmerId } = req.body;
    console.log('Request body:', req.body); // Log the request body for debugging

    // Validate groupId format
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ message: 'Invalid groupId format' });
    }

    if (!farmerId) {
      return res.status(400).json({ message: 'Farmer ID is required' });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    group.farmers.push(farmerId);
    await group.save();

    res.json({ message: 'Farmer assigned to group successfully', group });
  } catch (error) {
    console.error('Error assigning farmer to group:', error.message);
    res.status(500).json({ message: 'Failed to assign farmer to group', error: error.message });
  }
});

// Edit a group
router.put('/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;
    const { name } = req.body;

    // Validate groupId format
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ message: 'Invalid groupId format' });
    }

    if (!name) {
      return res.status(400).json({ message: 'Group name is required' });
    }

    const updatedGroup = await Group.findByIdAndUpdate(groupId, { name }, { new: true });
    if (!updatedGroup) {
      return res.status(404).json({ message: 'Group not found' });
    }

    res.json({ message: 'Group updated successfully', group: updatedGroup });
  } catch (error) {
    console.error('Error updating group:', error.message);
    res.status(500).json({ message: 'Failed to update group', error: error.message });
  }
});

// Delete a group
router.delete('/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;

    // Validate groupId format
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ message: 'Invalid groupId format' });
    }

    const deletedGroup = await Group.findByIdAndDelete(groupId);
    if (!deletedGroup) {
      return res.status(404).json({ message: 'Group not found' });
    }

    res.json({ message: 'Group deleted successfully', group: deletedGroup });
  } catch (error) {
    console.error('Error deleting group:', error.message);
    res.status(500).json({ message: 'Failed to delete group', error: error.message });
  }
});

module.exports = router;