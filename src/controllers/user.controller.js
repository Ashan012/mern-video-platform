import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrors.js";
import { User } from "../models/user.model.js";
import { uploadFileCloudinary } from "../utils/Cloudinary.js";
import { ApiResponse } from "../utils/Apiresponse.js";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "something went wrong, while generating access and refersh token"
    );
  }
};

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
  let coverImageLocalPath;

  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }
  console.log("coverImageLocalPath===>", coverImageLocalPath);
  console.log("req===>", req);
  console.log("req files===>", req.files);
  console.log("req.body====>", req.body);

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

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  console.log("createdUser===>", createdUser);

  if (!createdUser) {
    throw new ApiError(500, "Some thing went wrong while registering User");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "user Register Sucessfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email) {
    throw new ApiError(400, "username or password is required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (!user) {
    throw new ApiError(404, "user Dosen't exist");
  }

  const passwordValid = await user.isPasswordCorrect(password);
  if (!passwordValid) {
    throw new ApiError(401, "Invalid Password");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken)
    .cookie("refreshToken", refreshToken)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "user logged in Successfully"
      )
    );
});
export { registerUser, loginUser };
