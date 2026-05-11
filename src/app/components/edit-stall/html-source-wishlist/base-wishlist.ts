import { inject, signal, WritableSignal } from '@angular/core';
import { ControlContainer, FormGroup } from '@angular/forms';
export class BaseWishlist<T> {
  protected _stallId = '';
  protected _wishlistId = '';
  protected _data: T = {} as T;
  private _configJson: string = '';

  private parentContainer = inject(ControlContainer);

  // 取得父層的 FormGroup
  get parentForm() {
    return this.parentContainer.control as FormGroup;
  }

  get data(): T {
    if (!this._data || Object.keys(this._data).length === 0) {
      this._data = this.fromJson();
    }
    return this._data;
  }

  get wishlistId() {
    return this._wishlistId;
  }

  constructor() {
    this._stallId = this.parentForm.get('stallId')?.value;
    this._wishlistId = this.parentForm.get('htmlWishlistId')?.value;
    this._configJson = this.parentForm.get('htmlWishlistConfigJson')?.value;
  }

  // 將當前實例轉換為 JSON 字串，存入 DB
  toStr(): string {
    return JSON.stringify(this._data);
  }

  // 從 DB 撈出的字串轉換回物件實例
  fromJson<T>(): T {
    const obj = JSON.parse(this._configJson);
    return obj as T;
  }

  initValues(jsonStr: string, wishlistId: string) {
    this._configJson = jsonStr;
    this._wishlistId = wishlistId;
  }

  // 預設實作，子類別可覆寫以提供具體的驗證邏輯
  checkDataValidity(): boolean {
    return false;
  }

  // 預設實作，子類別可覆寫以提供具體的驗證邏輯
  loadMappingWishlist() {}
}
