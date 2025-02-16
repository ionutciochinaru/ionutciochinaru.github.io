export const BaseList = {
    props: {
        items: {
            type: Array,
            required: true
        },
        variant: {
            type: String,
            default: 'default',
            validator: (value) => ['default', 'compact', 'bordered'].includes(value)
        }
    },
    template: `
        <div class="list-container" :class="'list--' + variant">
            <div v-for="(item, index) in items" 
                 :key="index"
                 class="list-item"
                 :class="{'border--h-1': variant === 'bordered'}">
                <div class="list-marker bg-gray-2">•</div>
                <div class="list-content">{{ item }}</div>
            </div>
        </div>
    `
}