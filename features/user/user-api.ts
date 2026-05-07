import { User } from "@/features/auth/auth-api";
import { api, ApiResponse, unwrapApiResponse } from "@/services/api";

export type UpdateProfileRequest = {
  firstName: string;
  lastName: string;
};

export type UpdateProfileResponse = {
  user: User;
};

export const userApi = api.injectEndpoints({
  endpoints: (builder) => ({
    updateProfile: builder.mutation<User, UpdateProfileRequest>({
      query: (body) => ({
        url: "users/update-profile",
        method: "PATCH",
        body,
      }),
      transformResponse: (response: ApiResponse<UpdateProfileResponse>) => {
        const unwrapped = unwrapApiResponse(response);
        return unwrapped.user;
      },
      invalidatesTags: ["Auth"],
    }),
    updateProfilePicture: builder.mutation<User, FormData>({
      query: (formData) => ({
        url: "users/update-profile-picture",
        method: "PATCH",
        body: formData,
      }),
      transformResponse: (response: ApiResponse<UpdateProfileResponse>) => {
        const unwrapped = unwrapApiResponse(response);
        return unwrapped.user;
      },
      invalidatesTags: ["Auth"],
    }),
  }),
});

export const { useUpdateProfileMutation, useUpdateProfilePictureMutation } =
  userApi;
