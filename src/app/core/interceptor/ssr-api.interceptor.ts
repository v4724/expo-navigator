// ssr-api.interceptor.ts
import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { of } from 'rxjs';

export const ssrApiInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);

  // 1. 如果是在 Server / Build 階段，統一攔截所有 API 請求
  if (isPlatformServer(platformId)) {
    // console.log(`[SSR] Bypassing API request: ${req.url}`);

    // 直接模擬回傳成功的 200 Response，內容為空物件（或空陣列）
    return of(new HttpResponse({
      status: 200,
      body: [] // 或根據情境回傳 {}
    }));
  }

  // 2. 在 Client 瀏覽器端，直接讓請求以相對路徑發出
  return next(req);
};
