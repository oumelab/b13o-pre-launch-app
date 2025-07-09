"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, Loader2 } from "lucide-react";
import useReservationForm from "./_hooks/use-reservation-form";

export default function ReservePage() {
  const {
    isLoading,
    register,
    handleSubmit,
    errors,
    handleInterestChange,
    selectedInterests,
    interestOptions,
    onSubmit,
  } = useReservationForm();

  return (
    <>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            もくもくReactに事前登録する
          </h1>
          <p className="text-slate-300">
            ウェイティングリストに登録し、先行アクセス権とお知らせを受け取りましょう。
          </p>
        </div>

        {/* 登録フォーム */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">登録情報</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* 名前入力フィールド */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-200">
                  お名前
                </Label>
                <Input
                  id="name"
                  type="text"
                  {...register("name")}
                  className={`bg-slate-700 border-slate-600 text-white placeholder-slate-400 ${
                    errors.name ? "border-red-500" : ""
                  }`}
                  placeholder="お名前を入力"
                />
                {errors.name && (
                  <p className="text-sm text-red-400">{errors.name.message}</p>
                )}
              </div>

              {/* メールアドレス入力フィールド */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-200">
                  メールアドレス
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  className={`bg-slate-700 border-slate-600 text-white placeholder-slate-400 ${
                    errors.email ? "border-red-500" : ""
                  }`}
                  placeholder="メールアドレスを入力"
                />
                {errors.email && (
                  <p className="text-sm text-red-400">{errors.email.message}</p>
                )}
              </div>

              {/* 興味のあるサービス選択フィールド */}
              <div className="space-y-4">
                <Label className="text-slate-200">興味のあるサービス</Label>
                <div className="space-y-3">
                  {interestOptions.map((interest) => (
                    <div
                      key={interest.id}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={interest.id}
                        checked={selectedInterests.includes(interest.id)}
                        onCheckedChange={(checked) =>
                          handleInterestChange(interest.id, checked as boolean)
                        }
                        className="border-slate-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                      />
                      <Label
                        htmlFor={interest.id}
                        className="text-slate-300 cursor-pointer"
                      >
                        {interest.label}
                      </Label>
                    </div>
                  ))}
                </div>
                {errors.interests && (
                  <p className="text-sm text-red-400">
                    {Array.isArray(errors.interests)
                      ? errors.interests[0]?.message
                      : errors.interests.message}
                  </p>
                )}
              </div>

              {/* 送信ボタン */}
              <Button
                size="lg"
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:opacity-80 text-lg py-3 rounded-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    処理中...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-5 w-5" />
                    事前登録する
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
