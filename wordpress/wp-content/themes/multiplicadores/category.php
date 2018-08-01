<?php get_header(); ?>

	<main class="conteudo-principal" role="main">
		<!-- section -->
		<section>

			<h1>Categoria: <?php single_cat_title(); ?></h1>

			<?php get_template_part('loop'); ?>

			<?php get_template_part('pagination'); ?>

		</section>
		<!-- /section -->
	</main>

<?php get_sidebar(); ?>

<?php get_footer(); ?>
