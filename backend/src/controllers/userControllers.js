import { User } from "../models/userModel.js";
import httpStatus from "http-status";
import bycrpt, { hash } from "bcrypt";
import crypto from "crypto";

const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      message: "Please provide detail",
    });
  }

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(httpStatus.NOT_FOUND).redirect("/register");
    }

    const isMatch = await bycrpt.compare(password, user.password);

    if (isMatch) {
      let token = crypto.randomBytes(20).toString("hex");

      user.token = token;

      await user.save();

      return res.status(httpStatus.OK).json({
        token: token,
      });
    }

    return res.status(httpStatus.UNAUTHORIZED).json({
      message: "Invalid password",
    });
  } catch (err) {

    console.error(err);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

const register = async (req, res) => {
  const { name, username, password } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res
        .status(httpStatus.FOUND)
        .json({ message: "User already exists" });
    }

    const hashedPassword = await bycrpt.hash(password, 10);

    const newUser = new User({
      name: name,
      username: username,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(httpStatus.CREATED).json("User Registered");
  } catch (err) {
    res.json({ message: `Something went wrong ${err}` });
  }
};

export { login, register };
