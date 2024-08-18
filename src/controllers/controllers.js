// Define your controller methods
exports.getExamples = async (req, res) => {
  try {
    res.json({ message: "Hello World" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.createExample = async (req, res) => {
  try {
    const { name } = req.body;
    console.log(name);

    res.json({ name });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};
