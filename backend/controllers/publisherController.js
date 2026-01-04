const Publisher = require("../models/Publisher");

// Lấy tất cả nhãn hiệu
exports.getAllPublishers = async (req, res) => {
  try {
    const publishers = await Publisher.find().select("-__v").sort({ name: 1 });
    res.json(publishers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Lỗi server");
  }
};

// Tạo nhãn hiệu mới
exports.createPublisher = async (req, res) => {
  try {
    const { name } = req.body;

    // Kiểm tra xem nhãn hiệu đã tồn tại chưa
    let publisher = await Publisher.findOne({ name });
    if (publisher) {
      return res.status(400).json({ msg: "nhãn hiệu này đã tồn tại" });
    }

    publisher = new Publisher({
      name,
    });

    await publisher.save();
    res.json(publisher);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Lỗi server");
  }
};

// Cập nhật nhãn hiệu
exports.updatePublisher = async (req, res) => {
  try {
    const { name } = req.body;

    // Kiểm tra xem tên mới đã tồn tại chưa
    const existingPublisher = await Publisher.findOne({
      name,
      _id: { $ne: req.params.id },
    });
    if (existingPublisher) {
      return res.status(400).json({ msg: "nhãn hiệu này đã tồn tại" });
    }

    const publisher = await Publisher.findByIdAndUpdate(
      req.params.id,
      {
        name,
        updatedAt: Date.now(),
      },
      { new: true }
    );

    if (!publisher) {
      return res.status(404).json({ msg: "Không tìm thấy nhãn hiệu" });
    }

    res.json(publisher);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Lỗi server");
  }
};

// Xóa nhãn hiệu
exports.deletePublisher = async (req, res) => {
  try {
    const publisher = await Publisher.findById(req.params.id);
    if (!publisher) {
      return res.status(404).json({ msg: "Không tìm thấy nhãn hiệu" });
    }

    await Publisher.findByIdAndDelete(req.params.id);
    res.json({ msg: "nhãn hiệu đã được xóa" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Lỗi server");
  }
};
