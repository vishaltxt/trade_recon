import { User } from "../../modals/userModels/user-model.js";
import fs from 'fs'
import path from 'path';

export const register = async (req, res) => {
  try {
    // console.log(req.body);
    const { firstname, lastname , email, phone, password } = req.body;
    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(400).json({ msg: "email already exists" });
    }
    // const saltRound = 10;
    // const hash_password = await bcrypt.hash(password, saltRound);
    const userCreated = await User.create({
      firstname,
      lastname,
      email,
      phone,
      password,
      role: "reader",      // normal registration
      createdBy: "self",
    });
    console.log(req.body);
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
        role: userExist.role,
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
export const read = (req, res) => {
  try {
    const filePath = process.env.FILE_PATH;

    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading file:', err);
        return res.status(500).json({ error: 'Failed to read file' });
      }

      // Split by line and filter empty lines
      const lines = data.trim().split('\r\n').filter(line => line);

      // Define your custom keys
      const keys = [
        "id", "segment", "instrument", "symbol", "expiry", "strike_price",
        "option_type", "contract", "multiplier", "product_type", "lot_size",
        "client_code", "field_1", "field_2", "price", "quantity", "field_3",
        "order_no", "trade_no", "status", "cover", "order_time", "trade_time",
        "exchange_order_id", "ref_no", "entry_time", "branch_code"
      ];

      // Convert to structured JSON
      const parsedData = lines.map(line => {
        const values = line.split(',');
        const obj = {};
        keys.forEach((key, i) => {
          obj[key] = values[i] || "";
        });
        return obj;
      });

      res.json(parsedData);
    });
  } catch (error) {
    console.error('Controller error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};
// export const read = (req,res)=>{
//   try {
//     // const filePath = path.join(__dirname, 'data.txt');
//     const filePath = process.env.FILE_PATH;

//     fs.readFile(filePath, 'utf8', (err, data) => {
//         if (err) {
//             console.error('Error reading file:', err);
//             return res.status(500).json({ error: 'Failed to read file' });
//         }

//         res.json({ content: data });
//     });
//   } catch (error) {
//     console.log(error)
//   }
// }
  export const logout = (async (req, res, next) => {
    res
      // .status(201)
      // .cookie("token", "", {
      //   httpOnly: true,
      //   expires: new Date(Date.now()),
      //   secure: true,
      //   sameSite: "None",
      // })
      .json({
        success: true,
        message: "Logged Out Successfully.",
      });
  });
