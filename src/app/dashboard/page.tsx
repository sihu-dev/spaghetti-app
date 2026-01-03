/**
 * Dashboard - Catalog List
 * 카탈로그 목록 및 관리
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Plus, FileText, Download, Trash2, Calendar, Globe } from "lucide-react";

interface Catalog {
  id: string;
  title: string;
  company_name: string;
  product_count: number;
  language: string[];
  status: string;
  created_at: string;
  pdf_url?: string;
}

interface Profile {
  full_name: string;
  company_name?: string;
  credits: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const supabase = createClient();

      // 사용자 확인
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/signin");
        return;
      }

      // 프로필 로드
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
      }

      // 카탈로그 목록 로드
      const { data: catalogsData } = await supabase
        .from("catalogs")
        .select("*")
        .order("created_at", { ascending: false });

      if (catalogsData) {
        setCatalogs(catalogsData);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(catalogId: string) {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    try {
      const supabase = createClient();
      await supabase.from("catalogs").delete().eq("id", catalogId);
      setCatalogs(catalogs.filter(c => c.id !== catalogId));
    } catch (error) {
      console.error("Failed to delete:", error);
    }
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl">
            CATALOG<span className="text-blue-600">.AI</span>
          </Link>

          <div className="flex items-center gap-4">
            {/* Credits */}
            <div className="px-4 py-2 rounded-lg bg-blue-50 border border-blue-200">
              <span className="text-sm text-blue-900">
                크레딧: <span className="font-bold">{profile?.credits || 0}</span>
              </span>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{profile?.full_name}</p>
                {profile?.company_name && (
                  <p className="text-xs text-gray-500">{profile.company_name}</p>
                )}
              </div>
              <button
                onClick={handleSignOut}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">카탈로그</h1>
            <p className="text-gray-600">AI로 생성한 제품 카탈로그를 관리하세요</p>
          </div>

          <Link
            href="/dashboard/create"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-all shadow-sm hover:shadow-md"
          >
            <Plus className="w-5 h-5" />
            새 카탈로그
          </Link>
        </div>

        {/* Catalogs List */}
        {catalogs.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-12 text-center">
            <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              첫 카탈로그를 만들어보세요
            </h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              제품 사진을 업로드하면 AI가 자동으로 스펙을 추출하고 전문 카탈로그를 생성합니다
            </p>
            <Link
              href="/dashboard/create"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-all"
            >
              <Plus className="w-5 h-5" />
              시작하기
            </Link>
          </div>
        ) : (
          /* Catalog Cards */
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {catalogs.map((catalog) => (
              <div
                key={catalog.id}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all group"
              >
                {/* Thumbnail */}
                <div className="h-40 bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                  <FileText className="w-16 h-16 text-blue-600/20" />
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="font-bold text-lg text-gray-900 mb-2 truncate">
                    {catalog.title}
                  </h3>

                  <p className="text-sm text-gray-600 mb-4">{catalog.company_name}</p>

                  {/* Meta */}
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" />
                      {catalog.product_count}개 제품
                    </div>
                    <div className="flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5" />
                      {catalog.language.length}개 언어
                    </div>
                  </div>

                  {/* Status */}
                  <div className="mb-4">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        catalog.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : catalog.status === "generating"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {catalog.status === "completed"
                        ? "완료"
                        : catalog.status === "generating"
                        ? "생성 중"
                        : "임시 저장"}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {catalog.pdf_url && (
                      <a
                        href={catalog.pdf_url}
                        download
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-all"
                      >
                        <Download className="w-4 h-4" />
                        다운로드
                      </a>
                    )}

                    <button
                      onClick={() => handleDelete(catalog.id)}
                      className="p-2 rounded-lg border border-gray-200 hover:bg-red-50 hover:border-red-200 text-gray-600 hover:text-red-600 transition-all"
                      title="삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Created Date */}
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(catalog.created_at).toLocaleDateString("ko-KR")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
