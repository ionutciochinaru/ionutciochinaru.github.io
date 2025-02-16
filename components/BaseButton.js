export const BaseButton = {
    props: {
        variant: {
            type: String,
            default: 'default',
            validator: (value) => ['default', 'outline', 'text'].includes(value)
        },
        size: {
            type: String,
            default: 'medium',
            validator: (value) => ['small', 'medium', 'large'].includes(value)
        }
    },
    template: `
        <button 
            class="btn"
            :class="[
                'btn--' + variant,
                'btn--' + size,
                {'bg-gray-1': variant === 'default'},
                {'border--h-2': variant === 'outline'}
            ]"
        >
            <slot></slot>
        </button>
    `
}