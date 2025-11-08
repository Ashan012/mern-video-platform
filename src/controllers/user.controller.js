import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrors.js";
import { User } from "../models/user.model.js";
import { uploadFileCloudinary } from "../utils/Cloudinary.js";
import { ApiResponse } from "../utils/Apiresponse.js";

const registerUser = asyncHandler(async (req, res) => {
  const { email, username, fullname, password } = req.body;

  if (
    [email, username, fullname, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All feild are required");
  }

  const existedUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existedUser) {
    throw new ApiError(409, "Account Already Exist");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar File are required");
  }

  const avatar = await uploadFileCloudinary(avatarLocalPath);
  const coverImage = await uploadFileCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar File are required");
  }

  const user = await User.create({
    username: username.toLowerCase(),
    fullname,
    password,
    email,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });

  const createdUser = User.findById(user._id).select("-password -refreshToken");

  if (!createdUser) {
    throw new ApiError(500, "Some thing went wrong while registering User");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "user created Sucessfully"));
});
export { registerUser };
