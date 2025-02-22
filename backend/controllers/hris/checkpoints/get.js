const Checkpoint = require("../../../models/Checkpoints");
const getCheckpointDetails = async (req, res) => {
  try {
    const { checkpoint_id } = req.query;

    // Validate the query parameter
    if (!checkpoint_id) {
      return res.status(400).json({ message: "checkpoint_id is required." });
    }

    // Fetch the checkpoint details from the database
    const checkpoint = await Checkpoint.findOne({
      where: { id: checkpoint_id },
    });

    // Check if the checkpoint exists
    if (!checkpoint) {
      return res.status(404).json({ message: "Checkpoint not found." });
    }

    // Respond with the checkpoint details
    res.status(200).json({
      message: "Checkpoint details retrieved successfully.",
      checkpoint,
    });
  } catch (error) {
    console.error("Error fetching checkpoint details:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
module.exports = { getCheckpointDetails };
