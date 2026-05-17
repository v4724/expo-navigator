import { Component, inject } from '@angular/core';
import { StallService } from 'src/app/core/services/state/stall-service';
import { combineLatest, filter, take } from 'rxjs';
import { WishlistService } from 'src/app/core/services/state/wishlist-service';
import { Coomic4100MService } from 'src/app/components/edit-stall/html-source-wishlist/model/coomic4-100-m/coomic4-100-m-service';
import { Coomic4BokyakuService } from 'src/app/components/edit-stall/html-source-wishlist/model/coomic4-bokyaku/coomic4-bokyaku-service';
import { Coomic4KimetsuService } from 'src/app/components/edit-stall/html-source-wishlist/model/coomic4-kimetsu/coomic4-kimetsu-service';
import { Coomic4KoreaService } from 'src/app/components/edit-stall/html-source-wishlist/model/coomic4-korea/coomic4-korea-service';
import { Coomic4NucarnivalService } from 'src/app/components/edit-stall/html-source-wishlist/model/coomic4-nucarnival/coomic4-nucarnival-service';
import { Coomic4R1Service } from 'src/app/components/edit-stall/html-source-wishlist/model/coomic4-r1/coomic4-r1-service';
import { Coomic4ToukenService } from 'src/app/components/edit-stall/html-source-wishlist/model/coomic4-touken/coomic4-touken-service';
import { Coomic4UotoService } from 'src/app/components/edit-stall/html-source-wishlist/model/coomic4-uoto/coomic4-uoto-service';

import { StallData } from 'src/app/core/interfaces/stall.interface';
import { BaseService } from 'src/app/components/edit-stall/html-source-wishlist/model/base-service';
import { PromoApiService } from 'src/app/core/services/api/promo-api.service';
import { UpdatePromoStallDto } from 'src/app/core/models/promo-stall.model';
import { WishlistDefaultService } from 'src/app/components/edit-stall/html-source-wishlist/model/default-service';
import { Coomic4OrigService } from 'src/app/components/edit-stall/html-source-wishlist/model/coomic4-orig/coomic4-orig-service';

// 堪用，找到每個吃土單上的攤位，檢查目前攤位有沒有設定該吃土單資訊，若無則(根據吃土單上的作者)新增該攤位對應的宣傳車。

@Component({
  selector: 'app-insert-default-promo',
  imports: [],
  template: '',
  styles: ``,
})
export class InsertDefaultPromo {
  private _stallService = inject(StallService);
  private _wishlistService = inject(WishlistService);
  private _coomic4R1Service = inject(Coomic4R1Service);
  private _coomic4UotoService = inject(Coomic4UotoService);
  private _coomic4NucarnivalService = inject(Coomic4NucarnivalService);
  private _coomic4ToukenService = inject(Coomic4ToukenService);
  private _coomic4KoreaService = inject(Coomic4KoreaService);
  private _coomic4100MService = inject(Coomic4100MService);
  private _coomic4KimetsuService = inject(Coomic4KimetsuService);
  private _coomic4BokyakuService = inject(Coomic4BokyakuService);
  private _coomin4OrigService = inject(Coomic4OrigService);
  private _defaultService = inject(WishlistDefaultService);

  private _promoApiService = inject(PromoApiService);

  constructor() {
    combineLatest({
      stallFetchEnd: this._stallService.fetchEnd$,
      wishlistFetchEnd: this._wishlistService.fetchEnd$,
    })
      .pipe(
        filter(({ stallFetchEnd, wishlistFetchEnd }) => stallFetchEnd && wishlistFetchEnd),
        take(1),
      )
      .subscribe(() => {
        this._wishlistService.allWishlistItems.forEach((wishlist) => {
          let service: BaseService<any> | null = null;
          switch (wishlist.id) {
            case 'COOMIC4_R1': {
              service = this._coomic4R1Service;
              break;
            }
            case 'COOMIC4_UOTO': {
              service = this._coomic4UotoService;
              break;
            }
            case 'COOMIC4_NUCARNIVAL': {
              service = this._coomic4NucarnivalService;
              break;
            }
            case 'COOMIC4_TOUKEN': {
              service = this._coomic4ToukenService;
              break;
            }
            case 'COOMIC4_KOREA': {
              service = this._coomic4KoreaService;
              break;
            }
            // case 'COOMIC4_100_M': {
            //   service = this._coomic4100MService;
            //   break;
            // }
            case 'COOMIC4_KIMETSU': {
              service = this._coomic4KimetsuService;
              break;
            }
            case 'COOMIC4_BOKYAKU': {
              service = this._coomic4BokyakuService;
              break;
            }
            case 'COOMIC4_ORIG': {
              service = this._coomin4OrigService;
              break;
            }
            case 'COOMIC4_DEFAULT': {
              service = this._defaultService;
              break;
            }
          }

          if (!service) return;
          service.initial(wishlist.data, wishlist.html);
          service.fetchEnd$().subscribe(() => {
            Array.from(service.cacheByStallId.values()).forEach((sId) => {
              const s: StallData = this._stallService.findStall(sId as string) as StallData;
              if (!s) return;

              // 紀錄已經設定過的吃土單
              const setConfig = new Set<string>();
              s.promoData.forEach((p) => {
                if (p.promoHtmlWishlistId === wishlist.id && p.promoHtmlWishlistConfigJson) {
                  const json = JSON.parse(p.promoHtmlWishlistConfigJson);
                  json.authorName = json.authorName.toString();
                  setConfig.add(JSON.stringify(json));
                }
              });

              // 找出符合的攤位 keys (有多位作者時會有多筆資料)
              Array.from(service.cache.keys())
                .filter((key) => {
                  return key.indexOf(sId) > -1;
                })
                .forEach((key, idx) => {
                  const author = service.cache.get(key);

                  // 沒有商品不新增宣傳車 >> 先綁起來再說吧
                  // if (!author.items.length) return;

                  const set = new Set<string>([wishlist.tag]);
                  author.items.forEach((item: any) => {
                    switch (wishlist.id) {
                      case 'COOMIC4_R1':
                      case 'COOMIC4_KIMETSU': {
                        if (item.cp.length) {
                          item.cp.forEach((cat: string) => cat.trim() && set.add(cat.trim()));
                        }
                        break;
                      }
                      case 'COOMIC4_UOTO': {
                        if (item.originalWork.trim()) {
                          set.add(item.originalWork.trim());
                        }
                        if (item.cp.trim()) {
                          set.add(item.cp.trim());
                        }
                        break;
                      }
                      case 'COOMIC4_NUCARNIVAL':
                      case 'COOMIC4_TOUKEN':
                      case 'COOMIC4_100_M':
                      case 'COOMIC4_BOKYAKU': {
                        if (item.cp.trim()) {
                          set.add(item.cp.trim());
                        }
                        break;
                      }
                      case 'COOMIC4_KOREA': {
                        if (item.subject.trim()) {
                          set.add(item.subject.trim());
                        }
                        if (item.cp.trim()) {
                          set.add(item.cp.trim());
                        }
                        break;
                      }
                      case 'COOMIC4_ORIG': {
                        if (item.subject.trim()) {
                          set.add(item.subject.trim());
                        }
                        if (item.cp.length) {
                          item.cp.forEach((cat: string) => cat.trim() && set.add(cat.trim()));
                        }
                        break;
                      }
                      case 'COOMIC4_DEFAULT': {
                        if (item.subject.trim()) {
                          set.add(item.subject.trim());
                        }
                        if (item.cp.length) {
                          item.cp.forEach((cat: string) => cat.trim() && set.add(cat.trim()));
                        }
                        break;
                      }
                    }
                  });

                  const config = JSON.stringify({
                    authorName: author.authorName,
                    stallId: sId,
                  });
                  if (setConfig.has(config)) {
                    return;
                  } else {
                    setConfig.add(config);
                  }
                  const data: UpdatePromoStallDto = {
                    stallId: sId,
                    promoSort: s.promoData.length + idx,
                    promoTitle: wishlist.name,
                    promoAvatar: '',
                    promoLinks: [],
                    promoHtml: '',
                    promoHtmlSourceOption: 'WISHLIST',
                    promoHtmlWishlistId: wishlist.id,
                    promoHtmlWishlistConfigJson: config,
                    series: [],
                    tags: [],
                    customTags: Array.from(set)
                      .filter((val) => !!val)
                      .join(','),
                  };

                  // this._promoApiService.create(data).subscribe((res) => {
                  console.log(sId, author, data);
                  // });
                });
            });
          });
        });
      });
  }
}
