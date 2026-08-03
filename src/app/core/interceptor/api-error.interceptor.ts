import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { tap } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar'; // 或是你使用的 Toast/Notification 套件

export interface ApiResponse<T = any> {
  success: boolean;
  errors?: string[];
  data?: T;
  updatedAt?: string;
}

export const apiErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);

  return next(req).pipe(
    tap({
      next: (event) => {
        // 攔截成功的 HTTP 200 回應，但 Body 內部包含 success: false
        if (event instanceof HttpResponse && event.body) {
          const body = event.body as ApiResponse;
          if (body.success === false) {
            const errorMsg = body.errors?.join('\n') || '系統發生未知錯誤';

            // 💡 在這裡統一跳提示（如 Toast / SnackBar / Alert）
            snackBar.open(`請求失敗: ${errorMsg}`, '關閉', {
              duration: 4000,
              panelClass: ['error-snackbar'],
            });
          }
        }
      },
      error: (err) => {
        // 攔截 HTTP 非 200 (如 400, 500) 錯誤
        const errorMsg = err.error?.errors?.join('\n') || err.message || '網路連線異常';
        snackBar.open(`系統錯誤: ${errorMsg}`, '關閉', { duration: 4000 });
      },
    }),
  );
};
