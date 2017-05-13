main()

function main() {
    let search = location.search.substr(1)

    if (!search) {
        $('#container').text('To use this site, just tack on the original notablog url - e.g., notablog.github.io?grrm.livejournal.com/1305.html')
        return
    }

    let id = _(search).chain().split('').filter(c => c == c * 1).join('').value()
    console.log(id)

    $.getJSON('data/' + id + '.json').then(data => {
        console.log(data)
        window.data = data

        data.event = data.event.replace(/\n/g, '<br>')

        $('#container').append(
            $('<h3>').text(data.subject),
            $('<h4>').text(data.eventtime),
            $('<div>').html(data.event),
            $('<br>'),
            $('<h4>').text('Comments')
        )

        let $comments = $('<div>').appendTo($('#container'))
        let commentLevelById = {}

        for (var i = 0; i < (data.comments || []).length; i++) {
            let comment = data.comments[i]

            if (comment.parent) {
                commentLevelById[comment.dtalkid] = commentLevelById[comment.parent] + 1
            }
            else {
                commentLevelById[comment.dtalkid] = 0
            }

            let $comment = $('<div>').addClass('comment').append(
                $('<div>').addClass('comment-user' ).text(comment.dname),
                $('<div>').addClass('comment-time' ).text(comment.ctime),
                $('<div>').addClass('comment-title').text(comment.subject),
                $('<div>').addClass('comment-text' ).html(comment.article)
            ).css({paddingLeft: commentLevelById[comment.dtalkid] * 40}).appendTo($comments)
        }
    })
}