# System: Audio System（音效系統）

## Purpose
目前 GGS **沒有任何音檔資產** — 全部用 WebAudio API 合成。本 spec 紀錄當前合成策略、效能限制、未來「升級為真實音檔」的路線、**以及音檔升級後的具體預算分配與載入策略**。

## Current State

- 100% WebAudio API 合成
- 無 audio file dependencies
- 簡單而清楚，但容易被玩家評為「廉價」

## Requirements

### Requirement: WebAudio Synthesis
所有音效 SHALL 透過 WebAudio API 合成（current）：
- 武器發射：OscillatorNode + filter
- 命中：noise + envelope
- 升等：和弦合成
- BGM：（規劃）loop + procedural

### Requirement: Latency
聲音延遲 SHALL < 50ms（命中視覺與聲音）。

### Requirement: Volume Mix Discipline
- SFX 不可遮蓋 BGM
- Boss 出現時 BGM 切重音版
- UI 音（升等選卡）優先順位最高

### Requirement: Total Audio Budget (Hard)
**所有音檔總大小 SHALL ≤ 5 MB**（gzip 後實際傳輸量；解壓後在記憶體可至 ~15 MB）。Volt TA 簽字守線。

### Requirement: Per-Channel Budget Allocation
音檔預算 SHALL 依下表 4 個 channel 分配，且各 channel 不可互相借支（Audio Director 仲裁例外）：

| Channel | 上限 (gzip) | 預估實際 | Buffer | Owner |
|---|---:|---:|---:|---|
| Music (BGM + stingers) | 1.8 MB | ~1.6 MB | 0.2 MB | Music Composer (T-S2) |
| SFX (武器/命中/敵死/爆炸/升等/撿物) | 3.0 MB | ~2.0 MB | 0.5 MB（與 SFX Designer brief 一致） | SFX Designer (T-S3) |
| UI (點擊/hover/暫停) | 0.3 MB | ~0.1 MB | 0.2 MB | SFX Designer (T-S3) |
| Voice / Ambient（post-launch reserve） | 0.3 MB | 0.0 MB | 0.3 MB | TBD（Audio Director 拍板） |
| **Total** | **≤ 5.0 MB** | ~3.7 MB | ~1.2 MB | Audio Director (T-S1) 仲裁 |

⚠️ 「實際」欄是 11+ 隻敵人 + 8 把武器 + 5 元素全配齊時的估算，不是限額；買新 sound pack 前 SHALL 對著「實際 + 新增量」算，不可吃 Buffer 當常駐。

#### Scenario: SFX channel 用了 3.2 MB
- WHEN SFX 累計大於 3.0 MB
- THEN build SHALL NOT ship
- AND SFX Designer 必須裁掉低優先 SFX 或申請 Audio Director 從 Voice/Ambient buffer 借支
- AND 借支 SHALL 在 `art/audio-briefs/` 留下決策紀錄

#### Scenario: Voice / Ambient 在 Phase 1 出現
- WHEN 有人提議在 Phase 1（launch 前）加 voice over 或環境音
- THEN Audio Director SHALL escalate 到 CEO（這是 post-launch reserve）
- AND 不可從 Music 或 SFX channel 借

### Requirement: Music Track Breakdown
Music 的 1.8 MB 預算 SHALL 切為下列 tracks：

| Track | 長度 | 預算 | Loop? | Phase |
|---|---:|---:|:---:|:---:|
| Main menu theme | 60–90 s | 0.3 MB | ✅ | P1 |
| Combat BGM base | 90–180 s | 0.4 MB | ✅ | P1 |
| Combat intensity layer 1（calm → escalating，60s 後加入） | 同 base | 0.3 MB | ✅ | P1 |
| Combat intensity layer 2（miniboss / crisis） | 同 base | 0.3 MB | ✅ | P1 |
| Miniboss stinger（cross-fade overlay） | ≤ 8 s | 0.05 MB | ❌ | P1 |
| Boss music | 60–120 s | 0.3 MB | ✅ | P2（post-launch） |
| Death stinger | ≤ 4 s | 0.05 MB | ❌ | P1 |
| Victory stinger | ≤ 4 s | 0.05 MB | ❌ | P1 |
| Card selection mini-cue | ≤ 3 s | 0.05 MB | ❌ | P1 |
| **Music subtotal** | — | **1.80 MB** | — | — |

`music-composer.md` 已寫死「each track ≤ 1 MB」+「loop ≥ 60s ≤ 180s」+「intensity cross-fade ≤ 2s」 → 本表 SHALL 與 role spec 一致。

### Requirement: SFX Bank Breakdown
SFX 的 3.0 MB 預算 SHALL 切為下列 bank：

| Bank | 件數 | 預算 | 觸發點 | Phase |
|---|---:|---:|---|:---:|
| Weapon fire（8 把武器各 1 件） | 8 | 0.40 MB | AutoWeapon.fire() | P1 |
| Hit feedback（normal/electric/fire/ice/poison） | 5 | 0.20 MB | Projectile collision + DoT tick | P1 |
| Enemy death（11 隻 × variant ≤ 2） | ~16 | 0.45 MB | Enemy.die() | P1 |
| Explosion（bomber AoE + miniboss + boss） | 3 | 0.20 MB | Bomber.explode() / Boss climax | P1+P2 |
| Level-up jingle | 1 | 0.08 MB | Player.levelUp() | P1 |
| Card pick variants（3 卡同時） | 3 | 0.09 MB | CardPicker.confirm() | P1 |
| Heart / chest pickup | 2 | 0.06 MB | DropManager.pickup() | P1 |
| Lightning chain zap（chain hop 音） | 1 | 0.04 MB | LightningSystem.chain() | P1 |
| Element loop（poison cloud / fire DoT） | 2 | 0.08 MB | DotSystem.start() | P1 |
| Buffer（敵人 voice barks、新元素） | — | 1.40 MB | — | reserve |
| **SFX subtotal** | ~41 | **3.00 MB** | — | — |

`sfx-designer.md` 已寫死「polyphony ≤ 16 voices」+「latency ≤ 50 ms」+「無版權音檔」 → 本表 SHALL 與 role spec 一致。

### Requirement: Polyphony Allocation
WebAudio 同時播放 SHALL ≤ 16 voices（瀏覽器 audio thread 安全線）。分配如下：

| Layer | Voices | 溢位處理 |
|---|---:|---|
| SFX（武器 + 命中 + 死亡） | 12 | Voice stealing：刪最老的同 bank voice |
| UI（點擊 / hover） | 2 | 直接 drop（不 steal SFX） |
| Music（base + 1 intensity layer overlap during cross-fade） | 2 | 不可被 steal |
| **Total** | **16** | — |

#### Scenario: 大量爆炸引起 polyphony overflow
- WHEN bomber 同時爆 + 武器射擊 + 撿物，產生 > 12 voices 競爭 SFX 槽
- THEN SHALL 依「優先順位」reject：命中 > 爆炸 > 武器發射 > UI > pickup
- AND 不可踩進 Music 的 2 voice 配額（會被玩家感知為「斷音」）

### Requirement: Encoding & Format
所有音檔 SHALL 用 OGG Vorbis（Safari 早 fallback 已不需 mp3）。

| Channel | Codec | Bitrate (q) | 採樣率 | 聲道 |
|---|---|---|---|---|
| Music | OGG Vorbis | q4 (~96 kbps) | 44.1 kHz | stereo |
| SFX | OGG Vorbis | q2 (~48 kbps) | 44.1 kHz | mono |
| UI | OGG Vorbis | q1 (~32 kbps) | 44.1 kHz | mono |
| Voice (reserve) | OGG Vorbis | q3 (~64 kbps) | 22.05 kHz | mono |

Loudness 標準：
- Music：-14 LUFS integrated（與 streaming platforms 一致，避免進場炸耳）
- SFX peaks：≤ -6 dBFS（與 BGM 不互相 mask）
- UI peaks：≤ -10 dBFS（永遠不蓋 BGM）

### Requirement: Loading Strategy
為了維持「初始載入 ≤ 5 秒」（見 `performance-budgets.md`），音檔 SHALL 分層載入：

| 階段 | 內容 | 大小 | 載入時機 |
|---|---|---:|---|
| Critical（必載） | Main menu theme + 4 click SFX + 預設武器 fire SFX + 5 hit SFX | ≤ 0.8 MB | initial chunk，隨 JS bundle 載 |
| Wave-1（背景載） | Combat BGM base + 剩 7 把武器 fire SFX + 11 enemy death SFX | ~1.4 MB | 進場後 0–10 秒 idle 時 prefetch |
| Lazy（觸發載） | Intensity layer 1/2、boss music、爆炸音、stingers、撿物音 | ~1.5 MB | 對應系統第一次觸發前 0.5 秒 fetch |
| Post-launch（reserve） | Voice / Ambient | 0.3 MB | 不在 P1 載 |

#### Scenario: 第 60 秒 miniboss 出現但 stinger 沒載完
- WHEN miniboss 觸發但 stinger 還在 fetch
- THEN SHALL fallback 到「WebAudio 合成 stinger」（已實作的 procedural cue）
- AND 不可 block gameplay 等音檔

### Requirement: Cache & Reuse
所有 decoded `AudioBuffer` SHALL 在 module-level cache 後重用（與 ProjectilePool / EnemyPool 同紀律）：
- 不可在 update loop 內 `decodeAudioData`（會觸發 jank）
- SFX 同時播多份用 `BufferSourceNode` 複製，不重新 decode
- BGM 切換用 cross-fade GainNode，不可 stop + start

### Requirement: Mute / Volume Controls
玩家 SHALL 能在 pause menu 獨立調 4 個 channel volume：
- Master（影響全部）
- Music（影響 BGM + stingers）
- SFX（影響 SFX + element loops）
- UI（影響 click / hover / pickup）

預設 mix（避免新手第一輪炸耳）：
- Master 80%
- Music 60%
- SFX 80%
- UI 50%

## Future Upgrade Path

CEO 已標記為「優先升級」項目（避免被嫌廉價）：

1. **Audio Director (T-S1)** 領軍規劃聲音聖經（`art/audio-briefs/sound-bible.md`）
2. **SFX Designer (T-S3)** 評估購買 sound pack vs 委製，產出 SFX brief 對應上方 bank 表
3. **Music Composer (T-S2)** 寫 GGS 主題曲、戰鬥 BGM 與環境音，對應上方 track 表

升級為真實音檔時 SHALL：
- 通過 Volt TA 預算審（Total ≤ 5 MB；per-channel cap 不可破）
- 通過 CMO Harvest 版權審（採購 sound pack 前必簽授權）
- 通過 CAO Raven 美術一致性審（不可與「叢林廢墟 + 失落科技」世界觀脫節）

## Open Questions
- **OPEN-1（Music Composer）**：Combat intensity layer 是「同 base 加 layer」（聲音堆疊）還是「整曲換 stem」（音色全替）？前者省記憶體但 mix 複雜，後者直觀但要多 0.3–0.6 MB
- **OPEN-2（Audio Director）**：UI 的 0.3 MB reserve 是否該抽 0.1 MB 給 SFX「敵人語音 bark」（heavy 嘶吼、ranged 鳴叫）增強臨場感？
- **OPEN-3（CMO Harvest）**：採購 sound pack 預算是否該由 CMO 而非 CEO 簽？目前 audio-director.md 把採購預算 escalate 到 CEO + Terry，但 CMO 才管版權
- **OPEN-4（Volt TA）**：5 MB 上限是「gzip 後傳輸量」還是「decode 後記憶體量」？目前文件兩者混用，需 Volt 拍板統一

## Related Specs
- `systems/performance-budgets.md`（總載入時間、記憶體 cap）
- `roles/audio/audio-director.md`（authority + sound bible 路線）
- `roles/audio/sfx-designer.md`（SFX brief 與 polyphony 紀律）
- `roles/audio/music-composer.md`（BGM track 規格）
- 待補：`art/audio-briefs/sound-bible.md`
- 待補：`art/audio-briefs/sfx-bank-v1.md`

## Owner
- Spec: Audio Director (T-S1)
- Budget Authority: Volt TA (T-P5) — **per-channel cap 不可破**
- Authority: CTO Circuit（效能 + 載入時序）+ CMO Harvest（版權 + 採購）
- Final: CAO Raven（與視覺風格一致性）

## Changelog
- 2026-05-19: Initial documented (只有總額 5 MB)
- 2026-05-19 (tick #14): 補完 Per-Channel Budget Allocation（Music 1.8 / SFX 3.0 / UI 0.3 / Voice 0.3 MB）+ Music Track Breakdown（9 tracks）+ SFX Bank Breakdown（~41 件）+ Polyphony Allocation（12/2/2 voices）+ Encoding & Format（OGG q4/q2/q1）+ Loading Strategy（Critical/Wave-1/Lazy/Post-launch）+ Cache & Reuse + Mute/Volume + 4 OPEN questions（owner = Music Composer / Audio Director / CMO / Volt TA）
