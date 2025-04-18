import { User } from "../modals/user-model.js";

export const register = async (req, res) => {
  try {
    // console.log(req.body);
    const { username, email, phone, password } = req.body;
    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(400).json({ msg: "email already exists" });
    }
    // const saltRound = 10;
    // const hash_password = await bcrypt.hash(password, saltRound);
    const userCreated = await User.create({
      username,
      email,
      phone,
      password,
    });
    res.status(201).json({
      msg: "registration successfull",
      token: await userCreated.generateToken(),
      userId: userCreated._id.toString(),
    });
  } catch (error) {
    res.status(500).json("internal server error");
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.json("please provide email and password");
    }
    const userExist = await User.findOne({ email });
    // console.log(userExist);
    if (!userExist) {
      return res.status(400).json("invalid email or password");
    }
    // const isPasswordMatched = await bcrypt.compare(
    //   password,
    //   userExist.password
    // );
    const isPasswordMatched = await userExist.comparePassword(password);
    if (isPasswordMatched) {
      res.status(200).json({
        msg: "Login successfull",
        token: await userExist.generateToken(),
        userId: userExist._id.toString(),
      });
    } else {
      res.status(401).json({ message: "invalid email or password" });
    }
  } catch (error) {
    res.status(500).json("internal server error");
  }
};

export const recon = (req, res) => {
  try {
    res.send("recon baba");
  } catch (error) {
    console.log(error);
  }
};

//   export const logout = catchAsyncErrors(async (req, res, next) => {
//     res
//       .status(201)
//       .cookie("token", "", {
//         httpOnly: true,
//         expires: new Date(Date.now()),
//         secure: true,
//         sameSite: "None",
//       })
//       .json({
//         success: true,
//         message: "Logged Out Successfully.",
//       });
//   });
