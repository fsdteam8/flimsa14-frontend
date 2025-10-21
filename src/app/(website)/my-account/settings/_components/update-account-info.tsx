"use client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import z from "zod";

interface Avatar {
  url: string;
}

interface AccountInfo {
  avatar: Avatar;
  name: string;
  email: string;
}

interface Props {
  accountInfo: AccountInfo;
  isLoading: boolean;
}

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  avatar: z.instanceof(File).optional().or(z.literal("")),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const UpdateAccountInfo = ({ accountInfo, isLoading }: Props) => {
  const session = useSession();
  const token = session?.data?.user?.accessToken;
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(accountInfo?.avatar?.url || "");

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: accountInfo?.name || "",
      avatar: "",
    },
  });

  useEffect(() => {
    if (accountInfo) {
      form.reset({
        name: accountInfo.name || "",
        avatar: "",
      });
      setPreviewUrl(accountInfo.avatar?.url || "");
    }
  }, [accountInfo, form]);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      form.setValue("avatar", file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      const formData = new FormData();
      formData.append("name", data.name);
      if (data.avatar instanceof File) {
        formData.append("avatar", data.avatar);
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API}/user/update-profile`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update profile");
      }

      return await res.json();
    },
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["account-info", token] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (data: ProfileFormValues) => {
    updateProfileMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-6">
          <Skeleton className="h-28 w-28 rounded-full" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black/35 w-full p-5 rounded-lg">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div
                className="cursor-pointer relative group"
                onClick={handleImageClick}
              >
                <Image
                  src={previewUrl || "/placeholder.png"}
                  alt="Profile"
                  width={1000}
                  height={1000}
                  className="h-28 w-28 rounded-full object-cover border-2 border-gray-300 group-hover:border-blue-500 transition-colors"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-sm font-medium">
                    Change Photo
                  </span>
                </div>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>

            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-2">
                Click on the profile picture to upload a new image
              </p>
              <p className="text-xs text-muted-foreground">
                Supported formats: JPG, PNG, WebP • Max size: 5MB
              </p>
            </div>
          </div>

          <FormField
            control={form.control}
            name="avatar"
            render={() => (
              <FormItem className="hidden">
                <FormControl>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Input
            value={accountInfo?.email || ""}
            disabled
            className="bg-muted"
          />

          <Button disabled={updateProfileMutation.isPending} className="w-full">
            {updateProfileMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Update Profile
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default UpdateAccountInfo;
