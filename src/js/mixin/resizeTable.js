export default {
    methods: {
        resizeTable () {
            let thead, startOffset;

            document.querySelectorAll("table th").forEach(th => {
                th.style.position = 'relative';

                var grip = document.createElement('div');
                grip.classList.add('resizeTable');
                grip.innerHTML = "&nbsp;";

                grip.addEventListener('mousedown', function (e) {
                    thead = th;
                    startOffset = th.offsetWidth - e.pageX;
                });

                th.appendChild(grip);

                document.addEventListener('mousemove', function (e) {
                    if (thead) {
                        thead.style.width = startOffset + e.pageX + 'px';
                    }
                });
            });

            document.addEventListener('mouseup', function () {
                thead = undefined;
            });
        },
    },
}
