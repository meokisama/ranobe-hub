import { InfiniteScroll } from "@/components/ui/infinite-scroll";

export const CoverCarousel = () => {
  return (
    <div className="relative bg-background">
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center max-w-screen-xl mx-auto px-4">
        <div className="text-center bg-gray-800 text-white p-2 rounded-sm font-light space-y-2">
          <p>
            Tôi tin rằng chia sẻ truyện raw xét trên một khía cạnh nào đó vẫn có
            những giá trị nhất định. Cho những người đam mê dịch thuật và cho
            những độc giả không có điều kiện tiếp cận bản gốc. Xưa được cho, nay
            đi cho. Cho đi là nhận lại, nhưng việc &quot;cho đi&quot; để bị lợi
            dụng cho mục đích thương mại đã khiến tôi phải suy nghĩ.
          </p>
          <p>
            Tôi vẫn sẽ tiếp tục chia sẻ, nhưng sẽ thay đổi hình thức. Thay vì
            cung cấp file sách EPUB, tôi sẽ chia sẻ trực tiếp trên trình đọc có
            sẵn. Đây là giao diện tạm thời dành cho những tác phẩm mà các bạn đã
            yêu cầu (tính từ 20/03/2025).
          </p>
        </div>
      </div>
      <div className="opacity-40">
        <InfiniteScroll
          items="/anniv_cover01.jpg"
          direction="left"
          speed="slow"
          pauseOnHover={false}
        />
        <InfiniteScroll
          items="/anniv_cover02.jpg"
          direction="right"
          speed="slow"
          pauseOnHover={false}
        />
      </div>
    </div>
  );
};
