<template>
    <div class="error">
        <i class="el-icon-circle-close"></i> Could not load component.
    </div>
</template>

<script>
export default {
    name: 'Error',
}
</script>

<style lang="scss">
.error {
    left: 50%;
    top: 50%;
    z-index: 101;
    margin-left : -16px;
    margin-top : -16px;
    position: fixed;

    & > i {
        color: #ff4949; 
    }
}
</style>
