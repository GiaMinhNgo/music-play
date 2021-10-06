const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const cd = $('.cd')

const player = $('.player')
const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const playBtn = $('.btn-toggle-play')
const progress = $('#progress')
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const playList = $('.playlist')


const app = {
    currentIndex: 0,
    isPlaying: false, // mặc định là false
    isRandom: false,
    isRepeat: false,
    songs: [
        {
            name: 'Bông hoa đẹp nhất',
            sigger: 'Anh Quân AP',
            path: './assets/music/bonghoadepnhat.mp3',
            image: './assets/img/bonghoadepnhat.jpg'
        },
        {
            name: 'Chiều hôm ấy',
            sigger: 'JayKii',
            path: './assets/music/chieuhomay.mp3',
            image: './assets/img/chieuhomay.jpg'
        },
        {
            name: 'Đã lỡ yêu em nhiều',
            sigger: 'JustaTee',
            path: './assets/music/daloyeuemnhieu.mp3',
            image: './assets/img/daloyeuemnhieu.jpg'
        },
        {
            name: 'Đánh mất em',
            sigger: 'Đặng Quang Trần',
            path: './assets/music/danhmatem.mp3',
            image: './assets/img/danhmatem.jpg'
        },
        {
            name: 'Em không sai chúng ta sai',
            sigger: 'Erik',
            path: './assets/music/emkhongsaichungtasai.mp3',
            image: './assets/img/emkhongsaichungtasai.jpg'
        },
        {
            name: 'Lạ lùng',
            sigger: 'Vũ',
            path: './assets/music/lalung.mp3',
            image: './assets/img/lalung.jpg'
        },
        {
            name: 'Lời xin lỗi vụng về',
            sigger: 'Anh Quân AP',
            path: './assets/music/loixinloivungve.mp3',
            image: './assets/img/loixinloivungve.jpg'
        },
        {
            name: 'Old Town Road',
            sigger: 'Lil Nas X',
            path: './assets/music/OldTownRoad.mp3',
            image: './assets/img/OldTownRoad.jpg'
        },
        {
            name: 'The playah',
            sigger: 'Soobin Hoàng Sơn',
            path: './assets/music/theplayah.mp3',
            image: './assets/img/theplayah.jpg'
        },
        {
            name: 'Vài lần đón đưa',
            sigger: 'Soobin Hoàng Sơn',
            path: './assets/music/vailandondua.mp3',
            image: './assets/img/vailandondua.jpg'
        },
    ],
    render: function () {
        const htmls = this.songs.map((song, index) => {
            return `
            <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index = ${index}>
                <div class="thumb" 
                    style="background-image: url('${song.image}')">
                </div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.sigger}</p>
                </div>
                <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
            </div>
            `;
        })
        playList.innerHTML = htmls.join('');
    },
    defineProperties: function () {
        Object.defineProperty(this, 'currentSong', {
            get: function () {
                return this.songs[this.currentIndex]
            }
        })
    },
    handleEvents: function () {
        const cdWidth = cd.offsetWidth
        // xử lý CD quay / dung
        const cdThumbAnimate = cdThumb.animate([
            { transform: 'rotate(360deg)' }
        ], {
            duration: 10000, // quay trong 10s
            iterations: Infinity // lap lai bao nhieu lan: vo han
        })
        cdThumbAnimate.pause()


        // xử lý phóng to thu nhỏ CD-Thumb
        document.onscroll = function () {
            const scrollTop = window.scrollY || document.documentElement.scrollTop
            const newCdWidth = cdWidth - scrollTop

            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0
            cd.style.opacity = newCdWidth / cdWidth
        }

        // xử lý khi play
        playBtn.onclick = function () {
            if (app.isPlaying) {
                audio.pause()
            } else {
                audio.play()
            }
        }

        // khi bài hát được play
        audio.onplay = function () {
            app.isPlaying = true
            player.classList.add('playing')
            cdThumbAnimate.play()
        }

        // khi bài hát được pause
        audio.onpause = function () {
            app.isPlaying = false
            player.classList.remove('playing')
            cdThumbAnimate.pause()
        }

        // khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function () {
            if (audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100) // tính ra phần trăm bài hát
                progress.value = progressPercent
            }
        }

        // xử lý tua bài hát
        progress.onchange = function (e) {
            const seekTime = audio.duration / 100 * e.target.value
            audio.currentTime = seekTime
        }

        // xử lý next bài hát
        nextBtn.onclick = function () {
            if (app.isRandom) {
                app.playRandomSong()
            } else {
                app.nextSong()
            }
            audio.play()
            app.render()
            app.srollToActiveSong()
        }

        // xử lý prev bài hát
        prevBtn.onclick = function () {
            if (app.isRandom) {
                app.playRandomSong()
            } else {
                app.prevSong()
            }
            audio.play()
            app.render()
        }

        // xử lý bat / tat random bài hát
        randomBtn.onclick = function (e) {
            app.isRandom = !app.isRandom
            randomBtn.classList.toggle('active', app.isRandom) // đối số thứ 2 là boolean, true là add, fasle remove
        }

        // xử lý next bài hát khi audio ended
        audio.onended = function () {
            if (app.isRepeat) {
                audio.play()
            } else {
                nextBtn.click()
            }
        }

        // Lắng nghe click vào playlist
        playList.onclick = function (e) {
            const songClick = e.target.closest('.song:not(.active)')

            // closest return element cha hoặc con, nếu ko có thì null
            if (songClick || e.target.closest('.option')) {
                // Xử lý khi click vào bài hát
                if (songClick) {
                    app.currentIndex = Number(songClick.dataset.index) // dùng data-index nên sử dung dataset
                    app.loadCurrentSong()
                    audio.play()
                    app.render()
                }
                // xử lý khi click vào option
                if (e.target.closest('.option')) {

                }
            }
        }

        // xu lý phat lai 1 bai hat
        repeatBtn.onclick = function (e) {
            app.isRepeat = !app.isRepeat
            repeatBtn.classList.toggle('active', app.isRepeat) // đối số thứ 2 là boolean, true là add, fasle remove
        }
    },
    srollToActiveSong: function () {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'end'
            })
        }, 100)
    },
    loadCurrentSong: function () {
        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path
    },
    nextSong: function () {
        this.currentIndex++
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0
        }
        this.loadCurrentSong()
    },
    playRandomSong: function () {
        let newIdex
        do {
            newIdex = Math.floor(Math.random() * this.songs.length)
        } while (newIdex === this.currentIndex)
        this.currentIndex = newIdex
        this.loadCurrentSong()
    },
    prevSong: function () {
        this.currentIndex--
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1
        }
        this.loadCurrentSong()
    },
    start: function () {
        // định nghĩa các thuộc tính cho object
        this.defineProperties()

        // lắng nghe và xử lý các sự kiến (DOM events)
        this.handleEvents()

        // Tải bài hát đầu tiền vào UT khi chạy ứng dụng
        this.loadCurrentSong()
        // Render playlist
        this.render();
    }
}
app.start()
