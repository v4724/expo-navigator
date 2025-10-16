import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import DOMPurify, { Config } from 'dompurify';

@Pipe({
  name: 'safeHtml',
})
export class SafeHtmlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string | null | undefined): SafeHtml {
    value = value ?? '';

    // TODO 先依靠 ckeditor 的 htmlSupport 保護，待測其他情境 ex: fb、plurk、ig

    // const config: Config = {
    //   ALLOWED_TAGS: ['p', 'a', 'figure', 'img', 'div'],
    //   ALLOWED_ATTR: ['href', 'src', 'style', 'width', 'height', 'class'],
    // };

    // // 另外處理 fb
    if (value.includes('iframe') && value.includes('https://www.facebook.com/plugins')) {
      //   config.ADD_TAGS = ['iframe'];
      //   config.ALLOWED_URI_REGEXP = /^https:\/\/(www\.)?facebook\.com\/plugins\//i;

      value = this._preserveSizeAttributes(value);
    }

    // const clean = DOMPurify.sanitize(value, config);

    return value ? this.sanitizer.bypassSecurityTrustHtml(value) : '';
  }

  // FB 宣傳車，手動將 width, height 加到 style 上
  private _preserveSizeAttributes(html: string) {
    // 建立 DOM 方便取屬性
    const temp = document.createElement('div');
    temp.innerHTML = html;

    temp.querySelectorAll('iframe').forEach((el: Element) => {
      const width = el.getAttribute('width');
      const height = el.getAttribute('height');

      // 如果有 width / height，就加到 style
      if (width) {
        (el as HTMLIFrameElement).style.width = `100%`;
        el.removeAttribute('width');
      }
      if (height) {
        (el as HTMLIFrameElement).style.height = `${height}px`;
        el.removeAttribute('height');
      }
    });

    return temp.innerHTML;
  }
}
