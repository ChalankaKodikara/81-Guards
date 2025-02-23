const Checkpoint = require("../../../models/Checkpoints");
const QRCode = require("qrcode");
const path = require("path");
const fs = require("fs");

const addCheckpoint = async (req, res) => {
    try {
      const { name, client_id, employee_ids, location_name, location_address } =
        req.body;
  
      // Validate input data
      if (
        !name ||
        !client_id ||
        !employee_ids || 
        !location_name ||
        !location_address
      ) {
        return res.status(400).json({ message: "All fields are required." });
      }
  
      // Save checkpoint data to the database
      const checkpoint = await Checkpoint.create({
        name,
        client_id,
        employee_ids,
        location_name,
        location_address,
        qr_code_url: "", // Placeholder for QR code URL
      });
  
      // ** Generate QR Code with only the checkpoint_id **
      const qrData = {
        checkpoint_id: checkpoint.id, // Only include checkpoint_id
      };
  
      // Define the file path to save the QR code image
      const qrCodeDir = path.join(__dirname, "../../../public/qr-codes");
      const qrCodePath = path.join(qrCodeDir, `checkpoint-${checkpoint.id}.png`);
  
      // Ensure the directory exists
      if (!fs.existsSync(qrCodeDir)) {
        fs.mkdirSync(qrCodeDir, { recursive: true });
      }
  
      // Generate and save the QR code image
      await QRCode.toFile(qrCodePath, JSON.stringify(qrData));
  
      // Create a publicly accessible URL for the QR code
      const qrCodeUrl = `${req.protocol}://${req.get(
        "host"
      )}/api/checkpoints/qr-codes/checkpoint-${checkpoint.id}.png`;
  
      // Update the checkpoint record with the QR code URL
      checkpoint.qr_code_url = qrCodeUrl;
      await checkpoint.save();
  
      // Send the response with the checkpoint data and QR code URL
      res.status(201).json({
        message: "Checkpoint created successfully.",
        checkpoint: {
          id: checkpoint.id,
          name: checkpoint.name,
          client_id: checkpoint.client_id,
          employee_ids: checkpoint.employee_ids,
          location_name: checkpoint.location_name,
          location_address: checkpoint.location_address,
          qr_code_url: checkpoint.qr_code_url,
        },
      });
    } catch (error) {
      console.error("Error adding checkpoint:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  };
  
module.exports = { addCheckpoint };
