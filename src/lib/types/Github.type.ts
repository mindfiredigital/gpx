interface RequestDeviceCode {
  device_code: string;
  user_code: string;
  verification_uri: string;
  interval: number;
}
interface PollForAccessTokenData {
  access_token: string;
  error: string;
}

interface ProfileData {
  name: string;
  email: string;
}
interface EmailResponseArray {
  primary: string;
  verified: boolean;
  email: string;
}
interface GithubUser {
  email: string;
  login: string;
}

export type {
  RequestDeviceCode,
  PollForAccessTokenData,
  ProfileData,
  EmailResponseArray,
  GithubUser,
};
