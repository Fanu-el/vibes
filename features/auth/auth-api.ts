import {
  api,
  ApiResponse,
  AuthTokens,
  unwrapApiResponse,
} from "@/services/api";

export type RegisterRequest = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  joinDevice?: {
    deviceName?: string | null;
    deviceType?: string | null;
    osName?: string | null;
    osVersion?: string | null;
    modelName?: string | null;
    brand?: string | null;
  };
};

export type RegisterResponse = {
  message: string;
};

export type VerifyEmailRequest = {
  email: string;
  code: string;
};

export type VerifyEmailResponse = {
  message: string;
};

export type LoginRequest = {
  identifier: string;
  password: string;
};

export type ResendVerificationRequest = {
  email: string;
};

export type ResendVerificationResponse = {
  message: string;
};

export type ForgotPasswordRequest = {
  email: string;
};

export type ForgotPasswordResponse = {
  message: string;
};

export type ResetPasswordRequest = {
  email: string;
  code: string;
  newPassword: string;
};

export type ResetPasswordResponse = {
  message: string;
};

export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  vibeId: string;
  profilePictureFile?: {
    path: string;
  };
  joinDetails?: {
    joinedAt: string;
    joinDevice?: {
      deviceName?: string | null;
      deviceType?: string | null;
      osName?: string | null;
      osVersion?: string | null;
      modelName?: string | null;
      brand?: string | null;
    } | null;
  };
};

function toLoginPayload({ identifier, password }: LoginRequest) {
  const value = identifier.trim();

  if (value.toUpperCase().startsWith("VIBER-")) {
    return { vibeId: value, password };
  }

  return { email: value, password };
}

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<RegisterResponse, RegisterRequest>({
      query: (body) => ({
        url: "auth/register",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<RegisterResponse>) =>
        unwrapApiResponse(response),
    }),
    verifyEmail: builder.mutation<VerifyEmailResponse, VerifyEmailRequest>({
      query: (body) => ({
        url: "auth/verify-email",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<VerifyEmailResponse>) =>
        unwrapApiResponse(response),
    }),
    login: builder.mutation<AuthTokens, LoginRequest>({
      query: (body) => ({
        url: "auth/login",
        method: "POST",
        body: toLoginPayload(body),
      }),
      transformResponse: (response: ApiResponse<AuthTokens>) => {
        console.log(
          "Login API raw response:",
          JSON.stringify(response, null, 2),
        );
        const unwrapped = unwrapApiResponse(response);
        console.log(
          "Login API unwrapped data:",
          JSON.stringify(unwrapped, null, 2),
        );
        return unwrapped;
      },
    }),
    getMe: builder.query<User, void>({
      query: () => ({
        url: "auth/me",
        method: "GET",
      }),
      transformResponse: (response: ApiResponse<{ user: User }>) => {
        const unwrapped = unwrapApiResponse(response);
        return unwrapped.user;
      },
      providesTags: ["Auth"],
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: "auth/logout",
        method: "POST",
      }),
    }),
    resendVerification: builder.mutation<
      ResendVerificationResponse,
      ResendVerificationRequest
    >({
      query: (body) => ({
        url: "auth/resend-verification",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<ResendVerificationResponse>) =>
        unwrapApiResponse(response),
    }),
    forgotPassword: builder.mutation<
      ForgotPasswordResponse,
      ForgotPasswordRequest
    >({
      query: (body) => ({
        url: "auth/forgot-password",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<ForgotPasswordResponse>) =>
        unwrapApiResponse(response),
    }),
    resetPassword: builder.mutation<
      ResetPasswordResponse,
      ResetPasswordRequest
    >({
      query: (body) => ({
        url: "auth/reset-password",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<ResetPasswordResponse>) =>
        unwrapApiResponse(response),
    }),
  }),
});

export const {
  useRegisterMutation,
  useVerifyEmailMutation,
  useLoginMutation,
  useGetMeQuery,
  useLogoutMutation,
  useResendVerificationMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApi;
