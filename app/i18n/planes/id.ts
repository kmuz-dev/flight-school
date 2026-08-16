/**
 * Indonesian plane prose. Translated from planes/en.ts key for key.
 *
 * Writing bar (PRD §2): a sharp 10-year-old follows every instruction alone.
 * "Left" and "right" are places on the table, not reading order, so they are
 * translated literally and never swapped.
 */
import type { PlanesDictionary } from "../types";

const planes: PlanesDictionary = {
  planes: {
    dart: {
      name: "Si Panah",
      description:
        "Yang paling klasik. Dua belas lipatan, hidung runcing, dan terbang lurus dan cepat. Kalau seumur hidup kamu cuma pernah melipat satu pesawat kertas, kemungkinan besar bentuknya mirip yang ini.",
      throwTip:
        "Pegang dari bawah, dekat hidungnya. Arahkan sedikit ke atas lalu lempar cepat dan mendatar. Kalau menukik, tekuk sedikit tepi belakang kedua sayap ke atas.",
      titles: {
        "dart.step-01": "Lipat jadi dua",
        "dart.step-02": "Buka lagi",
        "dart.step-03": "Masukkan sudut kanan",
        "dart.step-04": "Sekarang sudut kiri",
        "dart.step-05": "Lipat sisi kanan sekali lagi",
        "dart.step-06": "Dan sisi kiri",
        "dart.step-07": "Lipat seluruh pesawat jadi dua",
        "dart.step-08": "Turunkan sayapnya",
        "dart.step-09": "Balik pesawatnya",
        "dart.step-10": "Berdirikan dengan hidung ke atas",
        "dart.step-11": "Buka sayap yang dekat",
        "dart.step-12": "Buka sayap yang jauh",
      },
      steps: {
        "dart.step-01":
          "Letakkan kertas berdiri, seperti pintu. Lipat tepi kanan sampai bertemu tepi kiri, lalu tekan sepanjang lipatan dengan ibu jari supaya bekasnya tinggal.",
        "dart.step-02":
          "Buka kertasnya kembali rata. Kamu akan melihat garis di tengah bekas lipatan tadi. Garis itu panduanmu untuk semua langkah berikutnya.",
        "dart.step-03":
          "Ambil sudut kanan atas dan lipat ke bawah dan ke dalam, sampai tepi atasnya persis di garis tengah. Tekan sampai rata.",
        "dart.step-04":
          "Lakukan hal yang sama persis di kiri: sudut kiri atas ke bawah dan ke dalam, sampai tepinya menyentuh garis tengah. Bagian atas sekarang mestinya seperti atap runcing.",
        "dart.step-05":
          "Lipat lagi seluruh tepi miring di sebelah kanan, sampai ikut berbaring di garis tengah. Hidungnya jadi lebih tipis dan lebih runcing.",
        "dart.step-06":
          "Sama di kiri. Sekarang kedua tepi miring bertemu di tengah, dan kertasnya jadi panjang dan sempit dengan ujung runcing di atas.",
        "dart.step-07":
          "Lipat seluruh pesawat jadi dua di garis tengah, tapi kali ini ke belakang, supaya semua lipatan yang barusan kamu buat berakhir di luar.",
        "dart.step-08":
          "Rebahkan menyamping. Lipat lapisan atas ke bawah untuk membuat sayap, mulai dari hidung terus ke belakang. Tekan kuat sepanjang lipatannya.",
        "dart.step-09":
          "Balik seluruh pesawat dan lihat sisi satunya. Periksa apakah sudah sama.",
        "dart.step-10":
          "Berdirikan pesawat dengan hidung ke atas dan lihat lurus menyusuri badannya. Kedua sayap mestinya sama.",
        "dart.step-11":
          "Pegang badannya dan angkat sayap atas sampai menjulur rata, seperti pesawat sungguhan dilihat dari depan.",
        "dart.step-12":
          "Balik dan lakukan hal yang sama pada sayap satunya. Kedua sayap sekarang mestinya menjulur mendatar, membentuk huruf V yang landai. Itulah Si Panah.",
      },
      explanations: {
        "dart.step-01":
          "Garis tengah adalah tulang punggung pesawat. Setiap lipatan berikutnya diukur dari situ.",
        "dart.step-02":
          "Yang kamu butuhkan cuma tandanya, bukan lipatannya. Melipat lalu membukanya lagi adalah cara meninggalkan panduan untuk diri sendiri.",
        "dart.step-03":
          "Lipatan sudut ini menumpuk kertas di hidung. Hidung yang berat itulah yang membuat pesawat terus menghadap ke depan, bukan berjungkir balik.",
        "dart.step-05":
          "Melipat sisinya sekali lagi membuat hidung lebih runcing dan lebih berat, jadi pesawat menembus udara bukan menahannya.",
        "dart.step-07":
          "Melipat ke belakang menaruh tepi-tepi tebal di luar, yang memberimu punggung untuk dipegang dan menjaga sayap tetap rata.",
        "dart.step-08":
          "Sayap adalah yang menahan pesawat di udara. Membuat kedua lipatan di tempat yang sama itulah yang membuatnya terbang lurus, bukan membelok.",
        "dart.step-11":
          "Sayap yang rata menangkap udara di bawahnya. Kalau sayapnya dibiarkan tertutup, pesawat tak punya tumpuan dan langsung jatuh.",
        "dart.step-12":
          "Kedua sayap harus sama. Kalau satu lebih tinggi dari yang lain, pesawat berguling ke arah itu, bukan terbang lurus.",
      },
      tips: {
        default: "Tekan setiap lipatan dengan kuku. Lipatan tajam terbang lebih baik daripada lipatan lembek.",
        "dart.step-01": "Sejajarkan sudut-sudutnya dulu sebelum menekan apa pun.",
        "dart.step-03":
          "Pelan-pelan saja menyejajarkan tepinya. Sudut yang miring di sini jadi terbang membelok nanti.",
        "dart.step-08":
          "Lipat kedua sayap sejauh yang sama dari tengah, atau pesawatnya akan membelok.",
        "dart.step-11": "Sayap lurus ke samping dan mendatar, dilihat dari depan, itu yang kamu mau.",
        "dart.step-12": "Bidik dari hidungnya: kedua sayap mestinya membentuk V yang landai.",
      },
    },

    bulldog: {
      name: "Panah Bulldog",
      description:
        "Si Panah dengan ujung runcingnya dilipat balik ke dirinya sendiri. Hasilnya hidung yang pendek, tumpul, dan berat, bukan seperti jarum. Dia lebih lambat daripada Si Panah tapi jauh lebih tangguh: tidak penyok saat menabrak dinding, dan tetap terbang lurus walau lipatanmu agak miring.",
      throwTip:
        "Genggam hidung tebalnya dari bawah dan lempar kuat dan mendatar, lurus ke depan. Dia tidak keberatan dilempar kasar.",
      titles: {
        "bulldog.step-01": "Lipat jadi dua",
        "bulldog.step-02": "Buka lagi",
        "bulldog.step-03": "Masukkan sudut kanan",
        "bulldog.step-04": "Sekarang sudut kiri",
        "bulldog.step-05": "Lipat sisi kanan sekali lagi",
        "bulldog.step-06": "Dan sisi kiri",
        "bulldog.step-07": "Lipat ujungnya kembali ke bawah",
        "bulldog.step-08": "Lipat seluruh pesawat jadi dua",
        "bulldog.step-09": "Turunkan sayapnya",
        "bulldog.step-10": "Balik pesawatnya",
        "bulldog.step-11": "Berdirikan dengan hidung ke atas",
        "bulldog.step-12": "Buka sayap yang dekat",
        "bulldog.step-13": "Buka sayap yang jauh",
      },
      steps: {
        "bulldog.step-01":
          "Letakkan kertas berdiri, seperti pintu. Lipat tepi kanan sampai bertemu tepi kiri, lalu tekan sepanjang lipatan dengan ibu jari supaya bekasnya tinggal.",
        "bulldog.step-02":
          "Buka kertasnya kembali rata. Kamu akan melihat garis di tengah bekas lipatan tadi. Garis itu panduanmu untuk semua langkah berikutnya.",
        "bulldog.step-03":
          "Ambil sudut kanan atas dan lipat ke bawah dan ke dalam, sampai tepi atasnya persis di garis tengah. Tekan sampai rata.",
        "bulldog.step-04":
          "Lakukan hal yang sama persis di kiri: sudut kiri atas ke bawah dan ke dalam, sampai tepinya menyentuh garis tengah. Bagian atas sekarang seperti atap runcing.",
        "bulldog.step-05":
          "Lipat lagi seluruh tepi miring di sebelah kanan, sampai ikut berbaring di garis tengah. Hidungnya jadi lebih tipis dan lebih runcing.",
        "bulldog.step-06":
          "Sama di kiri. Sekarang kedua tepi miring bertemu di tengah, dan kamu punya bentuk panjang dan sempit dengan ujung runcing di atas.",
        "bulldog.step-07":
          "Sekarang lipat ujung runcing itu lurus ke bawah menutupi pesawat. Turunkan ujungnya sampai mencapai titik tempat dua lipatan sudut pertamamu berakhir.",
        "bulldog.step-08":
          "Lipat seluruh pesawat jadi dua di garis tengah, tapi ke belakang, supaya semua lipatan yang barusan kamu buat berakhir di luar.",
        "bulldog.step-09":
          "Rebahkan menyamping. Lipat lapisan atas ke bawah untuk membuat sayap, mulai dari hidung tumpulnya terus sampai ke ekor.",
        "bulldog.step-10":
          "Balik seluruh pesawat dan lihat sisi satunya. Periksa apakah sayap kedua sudah sama dengan yang pertama.",
        "bulldog.step-11":
          "Berdirikan pesawat dengan hidung ke atas dan lihat lurus menyusuri badannya.",
        "bulldog.step-12":
          "Pegang badannya dan angkat sayap atas sampai menjulur hampir mendatar, seperti pesawat sungguhan dilihat dari depan.",
        "bulldog.step-13":
          "Balik dan lakukan hal yang sama pada sayap satunya. Kedua sayap mestinya menjulur mendatar, terangkat sedikit saja. Itulah Bulldog.",
      },
      explanations: {
        "bulldog.step-01":
          "Garis tengah adalah tulang punggung pesawat. Setiap lipatan berikutnya diukur dari situ.",
        "bulldog.step-02":
          "Yang kamu butuhkan cuma tandanya, bukan lipatannya. Melipat lalu membukanya lagi adalah cara meninggalkan panduan untuk diri sendiri.",
        "bulldog.step-03":
          "Lipatan sudut ini menumpuk kertas di bagian depan. Berat di depan itulah yang membuat pesawat terus menghadap ke depan, bukan berjungkir balik.",
        "bulldog.step-05":
          "Melipat sisinya sekali lagi kembali melipatgandakan kertas di depan. Sampai sini bentuknya persis Si Panah.",
        "bulldog.step-07":
          "Inilah lipatan yang menjadikannya Bulldog. Semua kertas runcing itu kembali dan duduk sebagai balok pendek dan tebal di depan.",
        "bulldog.step-08":
          "Melipat ke belakang menaruh tepi-tepi tebal di luar, yang memberimu punggung untuk dipegang dan menjaga sayap tetap rata.",
        "bulldog.step-09":
          "Sayap adalah yang menahan pesawat di udara. Membuat kedua lipatan di tempat yang sama itulah yang membuatnya terbang lurus, bukan membelok.",
        "bulldog.step-12":
          "Hidung tumpul menyingkirkan lebih banyak udara, jadi pesawat ini terbang lebih lambat. Sayap yang rata tetap memberinya daya angkat cukup untuk terus maju.",
        "bulldog.step-13":
          "Kedua sayap harus sama. Kalau satu lebih tinggi dari yang lain, pesawat berguling ke arah itu, bukan terbang lurus.",
      },
      tips: {
        default:
          "Tekan setiap lipatan dengan kuku. Pesawat ini paling pemaaf terhadap lipatan asal-asalan, tapi lipatan yang rapi tetap terbang lebih jauh.",
        "bulldog.step-05":
          "Di sini kertasnya empat lapis. Tekan sepanjang lipatannya, bukan di atasnya.",
        "bulldog.step-07":
          "Lipat ke depan menutupinya, bukan ke bawah. Balok tumpul itu harus berada di luar.",
        "bulldog.step-09":
          "Lipat kedua sayap sejauh yang sama dari tengah, atau pesawatnya akan membelok.",
        "bulldog.step-13": "Bidik dari hidungnya: kedua sayap mestinya terlihat hampir mendatar.",
      },
    },

    harrier: {
      name: "Si Harrier",
      description:
        "Peluncur besar yang lambat. Sayapnya hampir selebar kertasnya, dan hidungnya dilipat rata bukan runcing, jadi dia melayang bukan melesat. Sirip kecil di ujung sayap menahannya supaya tidak melenceng ke satu sisi. Dilempar pelan, dia menyeberangi ruangan sambil melayang dan mendarat dengan lembut.",
      throwTip:
        "Pegang di bawah badannya, tepat di belakang hidung. Arahkan sedikit ke atas dan lepaskan pelan-pelan. Kalau dilempar kuat, dia akan naik, kehilangan tenaga, lalu jatuh.",
      titles: {
        "harrier.step-01": "Lipat jadi dua",
        "harrier.step-02": "Buka lagi",
        "harrier.step-03": "Masukkan sudut kanan",
        "harrier.step-04": "Sekarang sudut kiri",
        "harrier.step-05": "Lipat ujungnya rata ke bawah",
        "harrier.step-06": "Lipat seluruh pesawat jadi dua",
        "harrier.step-07": "Turunkan sayap lebarnya",
        "harrier.step-08": "Balik pesawatnya",
        "harrier.step-09": "Berdirikan dengan hidung ke atas",
        "harrier.step-10": "Tekuk ke atas ujung sayap yang dekat",
        "harrier.step-11": "Tekuk ke atas ujung sayap yang jauh",
        "harrier.step-12": "Buka sayap yang dekat",
        "harrier.step-13": "Buka sayap yang jauh",
      },
      steps: {
        "harrier.step-01":
          "Letakkan kertas berdiri, seperti pintu. Lipat tepi kanan sampai bertemu tepi kiri, lalu tekan sepanjang lipatan dengan ibu jari supaya bekasnya tinggal.",
        "harrier.step-02":
          "Buka kertasnya kembali rata. Kamu akan melihat garis di tengah bekas lipatan tadi. Garis itu panduanmu untuk semua langkah berikutnya.",
        "harrier.step-03":
          "Ambil sudut kanan atas dan lipat ke bawah dan ke dalam, sampai tepi atasnya persis di garis tengah. Tekan sampai rata.",
        "harrier.step-04":
          "Lakukan hal yang sama persis di kiri: sudut kiri atas ke bawah dan ke dalam, sampai tepinya menyentuh garis tengah. Bagian atas sekarang seperti atap runcing.",
        "harrier.step-05":
          "Jangan meruncingkan ujungnya. Sebaliknya lipat lurus ke bawah, supaya ujungnya mendarat di titik tempat kedua lipatan sudut tadi berakhir. Bagian depannya jadi rata dan lebar.",
        "harrier.step-06":
          "Lipat seluruh pesawat jadi dua di garis tengah, tapi ke belakang, supaya lipatan yang barusan kamu buat berakhir di luar.",
        "harrier.step-07":
          "Rebahkan menyamping. Lipat lapisan atas ke bawah untuk membuat sayap, tapi kali ini mulai lipatannya sangat dekat dengan tepi terlipat, supaya sayapnya keluar lebar.",
        "harrier.step-08":
          "Balik seluruh pesawat dan lihat sisi satunya. Lipat sayap kedua supaya sama dengan yang pertama.",
        "harrier.step-09":
          "Berdirikan pesawat dengan hidung ke atas dan lihat lurus menyusuri badannya.",
        "harrier.step-10":
          "Ambil tepi paling luar sayap atas, kira-kira selebar ibu jari dari ujungnya, lalu tekuk ke atas. Berhenti di tengah jalan. Jangan dipipihkan.",
        "harrier.step-11":
          "Balik dan tekuk ujung sayap satunya ke atas sebanyak yang sama. Kedua sirip kecil itu mestinya jadi cermin satu sama lain.",
        "harrier.step-12":
          "Pegang badannya dan angkat seluruh sayap atas sampai menjulur hampir mendatar. Sirip yang tadi kamu buat sekarang mestinya berdiri di ujungnya.",
        "harrier.step-13":
          "Balik dan angkat sayap satunya dengan cara yang sama. Dilihat dari depan mestinya ada dua sayap lebar dan rata dengan dua ujung yang terangkat.",
      },
      explanations: {
        "harrier.step-01":
          "Garis tengah adalah tulang punggung pesawat. Setiap lipatan berikutnya diukur dari situ.",
        "harrier.step-02":
          "Yang kamu butuhkan cuma tandanya, bukan lipatannya. Melipat lalu membukanya lagi adalah cara meninggalkan panduan untuk diri sendiri.",
        "harrier.step-03":
          "Lipatan sudut ini menumpuk kertas di depan, dan berat itulah yang menjaga hidung tetap menghadap ke depan.",
        "harrier.step-05":
          "Bagian depan yang rata lebih lambat daripada yang runcing, dan lambat itulah yang diinginkan pesawat ini. Melipat ujungnya ke bawah juga menahan lipatan sudut supaya tidak membuka sendiri.",
        "harrier.step-06":
          "Melipat ke belakang menaruh tepi-tepi tebal di luar, yang memberimu punggung untuk dipegang dan menjaga sayap tetap rata.",
        "harrier.step-07":
          "Sayap lebar menahan beban lebih besar pada kecepatan lebih rendah. Itulah seluruh rahasia pesawat yang melayang alih-alih melesat.",
        "harrier.step-10":
          "Ujung sayap yang ditekuk ke atas bekerja seperti kemudi di masing-masing sisi. Kalau pesawat mulai menggeser ke samping, sirip-sirip itu mendorongnya lurus lagi.",
        "harrier.step-12":
          "Sayap yang rata menangkap udara di bawahnya. Dengan sayap selebar ini, lemparan pelan pun sudah memberi pesawat banyak tumpuan.",
        "harrier.step-13":
          "Kedua sayap harus sama. Kalau satu lebih tinggi dari yang lain, pesawat berguling ke arah itu, bukan melayang lurus.",
      },
      tips: {
        default:
          "Seluruh pesawat ini bergantung pada kedua sayap yang identik. Setiap kali kamu melipat satu sisi, angkat dan bandingkan dengan sisi satunya sebelum ditekan.",
        "harrier.step-05":
          "Arahkan ujungnya ke titik tempat kedua tepi miring bertemu, lalu tekan.",
        "harrier.step-07":
          "Sisakan hanya sebilah sempit di tengah untuk badannya. Sisanya semua sayap.",
        "harrier.step-10": "Tekuk, jangan dilipat. Sirip yang dipipihkan tidak berguna.",
        "harrier.step-13": "Lihat dari depan: dua sayap lebar, dua sirip kecil yang berdiri.",
      },
    },

    "sea-glider": {
      name: "Peluncur Laut",
      description:
        "Peluncur yang panjang dan tenang. Alih-alih melipat sudut lebih dulu, kamu menggulung tepi depannya dua kali, yang menaruh sebilah kertas berat tepat melintang di depan. Berat di tempat yang tepat itu membuatnya menempuh garis panjang, datar, dan lambat, seperti camar di atas laut. Dia bertahan di udara paling lama di antara semua pesawat di hanggar.",
      throwTip:
        "Pegang di bawah badannya dekat tengah. Arahkan mendatar, atau setipis rambut di atasnya, dan dorong menjauh dengan halus alih-alih dilempar.",
      titles: {
        "sea-glider.step-01": "Lipat jadi dua",
        "sea-glider.step-02": "Buka lagi",
        "sea-glider.step-03": "Gulung tepi atas ke bawah",
        "sea-glider.step-04": "Gulung sekali lagi",
        "sea-glider.step-05": "Masukkan sudut kanan",
        "sea-glider.step-06": "Sekarang sudut kiri",
        "sea-glider.step-07": "Lipat seluruh pesawat jadi dua",
        "sea-glider.step-08": "Turunkan sayap lebarnya",
        "sea-glider.step-09": "Balik pesawatnya",
        "sea-glider.step-10": "Berdirikan dengan hidung ke atas",
        "sea-glider.step-11": "Buka sayap yang dekat",
        "sea-glider.step-12": "Buka sayap yang jauh",
      },
      steps: {
        "sea-glider.step-01":
          "Letakkan kertas berdiri, seperti pintu. Lipat tepi kanan sampai bertemu tepi kiri, lalu tekan sepanjang lipatan dengan ibu jari supaya bekasnya tinggal.",
        "sea-glider.step-02":
          "Buka kertasnya kembali rata. Kamu akan melihat garis di tengah bekas lipatan tadi. Garis itu panduanmu untuk semua langkah berikutnya.",
        "sea-glider.step-03":
          "Lipat seluruh tepi atas ke arahmu, kira-kira selebar tiga jari. Jaga tepi lipatannya tetap sejajar dengan bagian atas kertas, lalu tekan sampai rata.",
        "sea-glider.step-04":
          "Lipat bilah tebal itu turun sekali lagi, sebanyak yang sama. Bagian depan kertas sekarang tiga lapis dan jelas terasa lebih kaku.",
        "sea-glider.step-05":
          "Cari titik tengah tepi depan yang baru dan tebal itu. Lipat sudut kanan atas ke bawah dan ke dalam, supaya tepi tebalnya berbaring di garis tengah.",
        "sea-glider.step-06":
          "Lakukan hal yang sama di kiri. Kedua tepi tebal sekarang bertemu di tengah dan bagian depannya meruncing.",
        "sea-glider.step-07":
          "Lipat seluruh pesawat jadi dua di garis tengah, tapi ke belakang, supaya lipatan yang barusan kamu buat berakhir di luar.",
        "sea-glider.step-08":
          "Rebahkan menyamping. Lipat lapisan atas ke bawah untuk membuat sayap, mulai lipatannya dekat tepi terlipat supaya sayapnya keluar lebar.",
        "sea-glider.step-09":
          "Balik seluruh pesawat dan lihat sisi satunya. Lipat sayap kedua supaya sama dengan yang pertama.",
        "sea-glider.step-10":
          "Berdirikan pesawat dengan hidung ke atas dan lihat lurus menyusuri badannya.",
        "sea-glider.step-11":
          "Pegang badannya dan angkat sayap atas sampai menjulur hampir mendatar, seperti pesawat sungguhan dilihat dari depan.",
        "sea-glider.step-12":
          "Balik dan angkat sayap satunya dengan cara yang sama. Dua sayap panjang dan rata, terangkat sedikit saja, dan selesai.",
      },
      explanations: {
        "sea-glider.step-01":
          "Garis tengah adalah tulang punggung pesawat. Setiap lipatan berikutnya diukur dari situ.",
        "sea-glider.step-02":
          "Yang kamu butuhkan cuma tandanya, bukan lipatannya. Melipat lalu membukanya lagi adalah cara meninggalkan panduan untuk diri sendiri.",
        "sea-glider.step-03":
          "Menggulung tepinya menyebarkan berat ke seluruh bagian depan pesawat alih-alih menumpuknya di satu titik. Tersebar begitu, berat itu menjaga pesawat tetap datar.",
        "sea-glider.step-04":
          "Dua gulungan membuat tepi depan bukan cuma berat tapi juga kaku. Tepi depan yang kaku tidak bergetar, dan sayap yang tidak bergetar melayang lebih jauh.",
        "sea-glider.step-05":
          "Melipat tepi berat itu ke dalam membawa seluruh beratnya ke hidung, dan di situlah sebuah peluncur membutuhkannya.",
        "sea-glider.step-07":
          "Melipat ke belakang menaruh tepi-tepi tebal di luar, yang memberimu punggung untuk dipegang dan menjaga sayap tetap rata.",
        "sea-glider.step-08":
          "Sayap panjang dan lebar ditambah ekor yang ringan adalah resep luncuran lambat dan datar. Sayap sempit akan membuat pesawat ini menukik.",
        "sea-glider.step-11":
          "Sayap yang rata menangkap udara di bawahnya, dan di sini ada banyak sekali sayap untuk menangkapnya.",
        "sea-glider.step-12":
          "Kedua sayap harus sama. Kalau satu lebih tinggi dari yang lain, pesawat berguling ke arah itu, bukan melayang lurus.",
      },
      tips: {
        default:
          "Setiap lipatan pesawat ini diukur dari lipatan sebelumnya, jadi gulungan yang miring di awal muncul sebagai pesawat yang miring di akhir.",
        "sea-glider.step-03":
          "Sejajarkan kedua sudut atas sebelum menekan, atau seluruh pesawat akan miring.",
        "sea-glider.step-04": "Lipat bilahnya ke atas dirinya sendiri, bukan seluruh lembarnya.",
        "sea-glider.step-08":
          "Sisakan hanya sebilah sempit di tengah untuk badannya. Sisanya semua sayap.",
        "sea-glider.step-12":
          "Kalau menukik saat dilempar, tekuk sedikit tepi paling belakang kedua sayap ke atas.",
      },
    },

    hammer: {
      name: "Si Palu",
      description:
        "Kelas berat. Kamu menggulung bagian depan kertas ke dirinya sendiri dua kali sebelum membentuk hidungnya, jadi ujung yang sudah jadi berisi enam lapis atau lebih yang padat. Semua berat di depan itu membuatnya menembus udara dan terbang sangat jauh. Dia paling sulit dilipat rapi di antara semuanya, dan paling memuaskan untuk dilempar.",
      throwTip:
        "Jepit hidung tebalnya dari bawah lalu lempar kuat, cepat, dan sedikit ke atas. Cuma pesawat inilah yang meminta seluruh tenagamu.",
      titles: {
        "hammer.step-01": "Lipat jadi dua",
        "hammer.step-02": "Buka lagi",
        "hammer.step-03": "Masukkan sudut kanan",
        "hammer.step-04": "Sekarang sudut kiri",
        "hammer.step-05": "Gulung ujungnya ke belakang",
        "hammer.step-06": "Gulung sekali lagi",
        "hammer.step-07": "Lipat sudut kanan ke tengah",
        "hammer.step-08": "Sekarang sudut kiri",
        "hammer.step-09": "Lipat seluruh pesawat jadi dua",
        "hammer.step-10": "Turunkan sayapnya",
        "hammer.step-11": "Balik pesawatnya",
        "hammer.step-12": "Berdirikan dengan hidung ke atas",
        "hammer.step-13": "Buka sayap yang dekat",
        "hammer.step-14": "Buka sayap yang jauh",
      },
      steps: {
        "hammer.step-01":
          "Letakkan kertas berdiri, seperti pintu. Lipat tepi kanan sampai bertemu tepi kiri, lalu tekan sepanjang lipatan dengan ibu jari supaya bekasnya tinggal.",
        "hammer.step-02":
          "Buka kertasnya kembali rata. Kamu akan melihat garis di tengah bekas lipatan tadi. Garis itu panduanmu untuk semua langkah berikutnya.",
        "hammer.step-03":
          "Ambil sudut kanan atas dan lipat ke bawah dan ke dalam, sampai tepi atasnya persis di garis tengah. Tekan sampai rata.",
        "hammer.step-04":
          "Lakukan hal yang sama persis di kiri. Bagian atas kertas sekarang seperti atap runcing.",
        "hammer.step-05":
          "Lipat ujungnya lurus ke bawah menutupi pesawat, supaya ujungnya mendarat di tempat kedua lipatan sudut tadi berakhir. Bagian depannya sekarang jadi tepi yang rata.",
        "hammer.step-06":
          "Lipat bagian depan yang rata itu turun sekali lagi, kali ini sedikit lebih pendek. Tepi depannya jadi lebih lebar dan jauh lebih tebal. Tekan kuat-kuat.",
        "hammer.step-07":
          "Cari titik tengah tepi depan yang tebal itu. Lipat sudut kanan tepi tersebut ke bawah dan ke dalam, sampai tepinya berbaring di garis tengah.",
        "hammer.step-08":
          "Lakukan hal yang sama dengan sudut kiri. Ujung baru muncul, dan semua kertas gulungan tadi sekarang terkemas di dalamnya.",
        "hammer.step-09":
          "Lipat seluruh pesawat jadi dua di garis tengah, tapi ke belakang, supaya semua yang barusan kamu lipat berakhir di luar.",
        "hammer.step-10":
          "Rebahkan menyamping. Lipat lapisan atas ke bawah untuk membuat sayap, mulai dari hidung terus sampai ke ekor.",
        "hammer.step-11":
          "Balik seluruh pesawat dan lihat sisi satunya. Lipat sayap kedua supaya sama dengan yang pertama.",
        "hammer.step-12":
          "Berdirikan pesawat dengan hidung ke atas dan lihat lurus menyusuri badannya. Hidungnya mestinya jadi balok padat yang bisa kamu jepit.",
        "hammer.step-13":
          "Pegang badannya dan angkat sayap atas sampai menjulur mendatar, seperti pesawat sungguhan dilihat dari depan.",
        "hammer.step-14":
          "Balik dan angkat sayap satunya dengan cara yang sama. Buat sayap ini lebih datar daripada pada peluncur. Itulah Si Palu.",
      },
      explanations: {
        "hammer.step-01":
          "Garis tengah adalah tulang punggung pesawat. Setiap lipatan berikutnya diukur dari situ.",
        "hammer.step-02":
          "Yang kamu butuhkan cuma tandanya, bukan lipatannya. Melipat lalu membukanya lagi adalah cara meninggalkan panduan untuk diri sendiri.",
        "hammer.step-03":
          "Lipatan sudut ini adalah muatan kertas pertama yang menuju hidung. Semua sesudahnya menumpuk lagi di atasnya.",
        "hammer.step-05":
          "Menggulung ujungnya ke belakang alih-alih meruncingkannya melipatgandakan kertas di depan. Kamu sedang membangun berat, bukan tusuk.",
        "hammer.step-06":
          "Setiap gulungan melipat sebilah yang sudah beberapa lapis tebalnya. Dua gulungan adalah batas kertas masih mau berbaring rata.",
        "hammer.step-07":
          "Ini menyeret seluruh batang gulungan itu masuk ke dalam ujungnya. Itulah yang membuat hidungnya jauh lebih berat daripada ekornya.",
        "hammer.step-09":
          "Melipat ke belakang menaruh tepi-tepi tebal di luar, yang memberimu punggung untuk dipegang dan menjaga sayap tetap rata.",
        "hammer.step-10":
          "Sayap yang lebih sempit berarti lebih sedikit udara yang mendorong balik, jadi pesawat berat mempertahankan kecepatannya dan menempuh jarak lebih jauh sebelum mendarat.",
        "hammer.step-13":
          "Pesawat yang cepat dan berat butuh daya angkat lebih sedikit, bukan lebih banyak, jadi sayap ini duduk lebih datar daripada sayap peluncur.",
        "hammer.step-14":
          "Kedua sayap harus sama. Pada kecepatan ini, perbedaan sekecil apa pun mengirim pesawat ke lintasan melengkung.",
      },
      tips: {
        default:
          "Tekan setiap lipatan dengan kuku, lalu tarik sepanjang tepi meja. Lipatan tebal akan membuka sendiri kalau tidak benar-benar kamu tekan.",
        "hammer.step-05":
          "Pelan-pelan saja. Kalau ujungnya mendarat miring, semua lipatan sesudahnya ikut miring.",
        "hammer.step-06": "Pipihkan yang ini dengan sesuatu yang keras, misalnya punggung sendok.",
        "hammer.step-07":
          "Enam lapis itu banyak. Lipat perlahan dan tahan kertasnya sambil kamu melipat.",
        "hammer.step-14":
          "Bidik dari hidungnya: sayapnya mestinya terlihat hampir mendatar, bukan seperti V yang dalam.",
      },
    },

    "square-cruiser": {
      name: "Penjelajah Persegi",
      description:
        "Satu-satunya pesawat di sini yang berangkat dari persegi, jadi hal pertama yang kamu lakukan adalah membuat satu. Persegi memberimu sayap pendek dan lebar serta badan yang gempal, dan ternyata itu menghasilkan penerbang yang mantap dan santai. Dia menyeberangi ruangan dalam garis lurus tanpa banyak ulah.",
      throwTip:
        "Pegang di bawah badannya di belakang hidung dan lempar mendatar dengan dorongan sedang. Dia tidak mau kecepatan, dia mau pelepasan yang halus.",
      titles: {
        "square-cruiser.prep.letter-01": "Lipat satu sudut",
        "square-cruiser.prep.letter-02": "Buka lagi",
        "square-cruiser.prep.letter-03": "Potong bilah sisanya",
        "square-cruiser.prep.a4-01": "Lipat satu sudut",
        "square-cruiser.prep.a4-02": "Buka lagi",
        "square-cruiser.prep.a4-03": "Potong bilah sisanya",
        "square-cruiser.prep.index-01": "Lipat satu sudut",
        "square-cruiser.prep.index-02": "Buka lagi",
        "square-cruiser.prep.index-03": "Potong bilah sisanya",
        "square-cruiser.step-01": "Lipat jadi dua",
        "square-cruiser.step-02": "Buka lagi",
        "square-cruiser.step-03": "Masukkan sudut kanan",
        "square-cruiser.step-04": "Sekarang sudut kiri",
        "square-cruiser.step-05": "Lipat ujungnya rata ke bawah",
        "square-cruiser.step-06": "Lipat sudut kanan ke tengah",
        "square-cruiser.step-07": "Sekarang sudut kiri",
        "square-cruiser.step-08": "Lipat seluruh pesawat jadi dua",
        "square-cruiser.step-09": "Turunkan sayapnya",
        "square-cruiser.step-10": "Balik pesawatnya",
        "square-cruiser.step-11": "Berdirikan dengan hidung ke atas",
        "square-cruiser.step-12": "Buka sayap yang dekat",
        "square-cruiser.step-13": "Buka sayap yang jauh",
      },
      steps: {
        "square-cruiser.prep.letter-01":
          "Letakkan lembarnya berdiri. Lipat sudut kiri atas ke seberang dan ke bawah, sampai tepi atasnya persis berbaring di tepi kanan. Tekan lipatannya sampai rata.",
        "square-cruiser.prep.letter-02":
          "Buka kertasnya kembali. Lipatan tadi meninggalkan garis melintang di lembar itu. Semua yang di atas garis itu adalah persegi yang sempurna.",
        "square-cruiser.prep.letter-03":
          "Potong sepanjang garis itu dan simpan perseginya. Sisihkan bilah sisanya, kamu tidak akan membutuhkannya.",
        "square-cruiser.prep.a4-01":
          "Letakkan lembarnya berdiri. Lipat sudut kiri atas ke seberang dan ke bawah, sampai tepi atasnya persis berbaring di tepi kanan. Tekan lipatannya sampai rata.",
        "square-cruiser.prep.a4-02":
          "Buka kertasnya kembali. Lipatan tadi meninggalkan garis melintang di lembar itu. Semua yang di atas garis itu adalah persegi yang sempurna.",
        "square-cruiser.prep.a4-03":
          "Potong sepanjang garis itu dan simpan perseginya. Sisihkan bilah sisanya, kamu tidak akan membutuhkannya.",
        "square-cruiser.prep.index-01":
          "Letakkan kartunya berdiri. Lipat sudut kiri atas ke seberang dan ke bawah, sampai tepi atasnya persis berbaring di tepi kanan. Tekan lipatannya sampai rata.",
        "square-cruiser.prep.index-02":
          "Buka kartunya kembali. Lipatan tadi meninggalkan garis melintang di kartu itu. Semua yang di atas garis itu adalah persegi yang sempurna.",
        "square-cruiser.prep.index-03":
          "Potong sepanjang garis itu dan simpan perseginya. Ini persegi kecil yang kaku, jadi bersiaplah dengan pesawat kecil yang tidak melayang jauh.",
        "square-cruiser.step-01":
          "Letakkan perseginya di depanmu. Lipat tepi kanan sampai bertemu tepi kiri, tekan sepanjang lipatannya, dan garis tengahmu sudah jadi.",
        "square-cruiser.step-02":
          "Buka lagi sampai rata. Garis di tengah itu panduanmu untuk semua langkah berikutnya.",
        "square-cruiser.step-03":
          "Lipat sudut kanan atas ke bawah dan ke dalam, supaya tepi atasnya berbaring di garis tengah. Pada persegi, sudut itu sampai tepat di titik tengah lembarnya.",
        "square-cruiser.step-04":
          "Lakukan hal yang sama di kiri. Separuh atas persegi sekarang jadi segitiga besar yang duduk di atas separuh bawahnya.",
        "square-cruiser.step-05":
          "Lipat ujung segitiga itu lurus ke bawah, supaya ujungnya mendarat di tengah persegi. Bagian depannya jadi rata dan lebar.",
        "square-cruiser.step-06":
          "Lipat sudut kanan bagian depan yang baru rata itu ke bawah dan ke dalam sampai garis tengah, supaya ujung baru muncul di atas lipatan yang barusan kamu buat.",
        "square-cruiser.step-07":
          "Lakukan hal yang sama di kiri. Kedua sudut bertemu di tengah dan mengunci lipatan di bawahnya supaya tetap di tempatnya.",
        "square-cruiser.step-08":
          "Lipat seluruh pesawat jadi dua di garis tengah, tapi ke belakang, supaya semua yang barusan kamu lipat berakhir di luar.",
        "square-cruiser.step-09":
          "Rebahkan menyamping. Lipat lapisan atas ke bawah untuk membuat sayap, mulai dari hidung terus sampai ke ekor.",
        "square-cruiser.step-10":
          "Balik seluruh pesawat dan lihat sisi satunya. Lipat sayap kedua supaya sama dengan yang pertama.",
        "square-cruiser.step-11":
          "Berdirikan pesawat dengan hidung ke atas dan lihat lurus menyusuri badannya.",
        "square-cruiser.step-12":
          "Pegang badannya dan angkat sayap atas sampai menjulur hampir mendatar, seperti pesawat sungguhan dilihat dari depan.",
        "square-cruiser.step-13":
          "Balik dan angkat sayap satunya dengan cara yang sama. Sayap pendek, lebar, mendatar, dan Penjelajah pun selesai.",
      },
      explanations: {
        "square-cruiser.prep.letter-01":
          "Melipat satu tepi ke tepi di sebelahnya adalah cara menemukan persegi tanpa penggaris. Lipatannya yang mengukur untukmu.",
        "square-cruiser.prep.letter-03":
          "Persegi menghasilkan sayap pendek dan lebar. Kalau kamu mulai dari lembar panjang, hasilnya pesawat yang sama sekali berbeda.",
        "square-cruiser.prep.a4-01":
          "Melipat satu tepi ke tepi di sebelahnya adalah cara menemukan persegi tanpa penggaris. Lipatannya yang mengukur untukmu.",
        "square-cruiser.prep.a4-03":
          "Persegi menghasilkan sayap pendek dan lebar. Kalau kamu mulai dari lembar panjang, hasilnya pesawat yang sama sekali berbeda.",
        "square-cruiser.prep.index-01":
          "Melipat satu tepi ke tepi di sebelahnya adalah cara menemukan persegi tanpa penggaris. Lipatannya yang mengukur untukmu.",
        "square-cruiser.prep.index-03":
          "Persegi menghasilkan sayap pendek dan lebar. Kalau kamu mulai dari lembar panjang, hasilnya pesawat yang sama sekali berbeda.",
        "square-cruiser.step-01":
          "Garis tengah adalah tulang punggung pesawat. Setiap lipatan berikutnya diukur dari situ.",
        "square-cruiser.step-02":
          "Yang kamu butuhkan cuma tandanya, bukan lipatannya. Melipat lalu membukanya lagi adalah cara meninggalkan panduan untuk diri sendiri.",
        "square-cruiser.step-03":
          "Pada persegi, lipatan sudut ini besar sekali, jadi separuh lembarnya berakhir berlapis dua di depan. Dari situlah berat pesawat ini datang.",
        "square-cruiser.step-05":
          "Melipat ujungnya rata membuat hidungnya tumpul dan menahannya supaya tidak menancap ke lantai setiap kali mendarat.",
        "square-cruiser.step-06":
          "Kedua sudut ini mengunci lipatan di bawahnya supaya hidungnya tidak terbuka di udara.",
        "square-cruiser.step-08":
          "Melipat ke belakang menaruh tepi-tepi tebal di luar, yang memberimu punggung untuk dipegang dan menjaga sayap tetap rata.",
        "square-cruiser.step-09":
          "Lembar persegi itu pendek dibanding lebarnya, jadi sayap ini keluar lebar dan gempal. Itulah yang membuat Penjelajah begitu mantap.",
        "square-cruiser.step-12":
          "Sayap yang rata menangkap udara di bawahnya. Sayap pendek harus benar-benar mendatar supaya bekerja.",
        "square-cruiser.step-13":
          "Kedua sayap harus sama. Kalau satu lebih tinggi dari yang lain, pesawat berguling ke arah itu, bukan meluncur lurus.",
      },
      tips: {
        default:
          "Semua di pesawat ini diukur dari garis tengah dan sudut-sudutnya, jadi dia jadi dengan ukuran persegi apa pun yang bisa kamu buat.",
        "square-cruiser.prep.a4-01":
          "Geser-geser sudutnya sampai tepi atas duduk persis di tepi sampingnya, baru tekan.",
        "square-cruiser.prep.a4-03":
          "Minta izin orang dewasa sebelum memakai gunting, dan potong di atas lipatannya, bukan di sebelahnya.",
        "square-cruiser.prep.letter-03":
          "Minta izin orang dewasa sebelum memakai gunting, dan potong di atas lipatannya, bukan di sebelahnya.",
        "square-cruiser.prep.index-03":
          "Di sini kertas printer bekerja lebih baik daripada karton. Karton kaku dan tidak akan menahan lipatan di hidungnya.",
        "square-cruiser.step-03":
          "Sudutnya mestinya mendarat tepat di tengah persegi. Pakai itu sebagai pemeriksaanmu.",
        "square-cruiser.step-06":
          "Jangan ganggu lipatan yang di bawah. Cuma dua sudut baru itu yang bergerak.",
        "square-cruiser.step-13": "Bidik dari hidungnya: dua sayap pendek, hampir mendatar.",
      },
    },
  },
  glossary: {
    "valley-fold": {
      term: "Lipatan lembah",
      definition: "Lipatan yang bekasnya cekung ke bawah seperti lembah. Kertasnya melipat ke arahmu.",
    },
    "mountain-fold": {
      term: "Lipatan gunung",
      definition:
        "Kebalikan lipatan lembah: bekasnya menonjol ke atas seperti gunung, dan kertasnya melipat menjauh darimu.",
    },
    crease: {
      term: "Bekas lipat",
      definition: "Garis tajam yang tertinggal setelah kamu melipat kertas dan menekannya sampai rata.",
    },
    "center-line": {
      term: "Garis tengah",
      definition:
        "Bekas lipat yang membelah tengah kertas dan kamu pakai sebagai panduan untuk lipatan-lipatan lain.",
    },
    "blunt-nose": {
      term: "Hidung tumpul",
      definition:
        "Hidung yang dibuat dengan melipat ujung runcing balik ke dirinya sendiri, jadi bagian depan pesawat rata dan tebal, bukan meruncing.",
    },
    hem: {
      term: "Kelim",
      definition:
        "Sebilah yang dilipat di sepanjang tepi lurus, seperti kelim baju. Gulung dua kali dan tepi itu jadi tebal dan berat.",
    },
    "partial-fold": {
      term: "Lipatan setengah",
      definition:
        "Lipatan yang kamu hentikan di tengah jalan, jadi kertasnya menekuk dan tetap menyudut alih-alih berbaring rata.",
    },
    "tip-fin": {
      term: "Sirip ujung",
      definition:
        "Bagian kecil di ujung sayap yang ditekuk ke atas. Dia menahan pesawat supaya tidak menggeser ke samping di udara.",
    },
    "square-from-rectangle": {
      term: "Membuat persegi",
      definition:
        "Lipat satu tepi lembar ke tepi di sebelahnya. Lipatan itu menandai persegi terbesar yang muat di dalam lembar, siap dipotong.",
    },
  },
};

export default planes;
export { planes };
