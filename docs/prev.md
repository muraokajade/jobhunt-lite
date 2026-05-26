### prevCompanies はどこから来るのか

`prevCompanies` は、自分でどこかから渡している変数ではありません。

ポイントは、`setCompanies` には「値」だけでなく、**関数**を渡すこともできるという点です。

---

## まず普通の更新

たとえば、次のように書くと、`companies` を新しい配列で更新しています。

```tsx
setCompanies(newCompanies);

これは、

setCompanies に「新しい値」を渡している

という形です。

今回の書き方

一方で、今回のコードはこうです。

setCompanies((prevCompanies) => {
  return [...prevCompanies, createdCompany];
});

これは、

setCompanies に「新しい値」ではなく「関数」を渡している

という形です。

setCompanies に渡している関数はどこか

この部分が、setCompanies に渡している関数です。

(prevCompanies) => {
  return [...prevCompanies, createdCompany];
}

図にすると、こうです。

setCompanies(
  ┌────────────────────────────────────┐
  │ (prevCompanies) => {               │
  │   return [...prevCompanies,        │
  │           createdCompany];         │
  │ }                                  │
  └────────────────────────────────────┘
)

つまり、setCompanies の引数として、ひとつの関数を渡しています。

Reactはこの関数をどう使うのか

Reactは、setCompanies に関数が渡されると、その関数を内部で実行します。

そのとき、現在の companies を関数の引数に入れてくれます。

イメージはこうです。

// 現在のcompanies
const currentCompanies = [
  { id: 1, name: "A社" },
  { id: 2, name: "B社" },
];

// React内部のイメージ
const nextCompanies = updater(currentCompanies);

この currentCompanies が、関数の引数である prevCompanies に入ります。

もう少し具体的なイメージ

実際には、こういう関数をReactに渡しているイメージです。

const updater = (prevCompanies) => {
  return [...prevCompanies, createdCompany];
};

setCompanies(updater);

Reactは内部で、この updater を実行します。

const nextCompanies = updater(現在のcompanies);

そのため、prevCompanies には「現在のcompanies」が入ります。

アロー関数を短く書いた形

上のコードを短くすると、最終的にこの形になります。

setCompanies((prevCompanies) => {
  return [...prevCompanies, createdCompany];
});

さらに、return だけの関数なので、短く書くとこうなります。

setCompanies((prevCompanies) => [...prevCompanies, createdCompany]);
まとめ
setCompanies((prevCompanies) => [...prevCompanies, createdCompany]);

このコードは、

Reactに「現在のcompaniesを受け取って、
新しい企業を追加した配列を返す関数」を渡している

という意味です。

prevCompanies はReactが特別に用意した変数ではなく、
setCompanies に渡した関数の引数です。

Reactがその関数を実行するときに、現在の companies を引数として入れてくれるため、prevCompanies が使えます。
```
