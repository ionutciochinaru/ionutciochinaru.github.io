export const BaseGrid = {
    props: {
        columns: {
            type: Number,
            default: 2
        },
        gap: {
            type: String,
            default: 'medium',
            validator: (value) => ['small', 'medium', 'large'].includes(value)
        }
    },
    template: `
        <div class="grid-container"
             :class="[
                'grid--cols-' + columns,
                'gap--' + gap
             ]"
        >
            <slot></slot>
        </div>
    `
}