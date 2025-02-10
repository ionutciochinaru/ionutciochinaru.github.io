export const BaseCard = {
    props: {
        bordered: {
            type: Boolean,
            default: true
        },
        padding: {
            type: String,
            default: 'medium'
        }
    },
    template: `
        <div class="card"
             :class="[
                {'border--h-1': bordered},
                'p--' + padding
             ]"
        >
            <slot></slot>
        </div>
    `
}